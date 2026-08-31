import { getSecure, saveSecure, deleteSecure } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://piperpoloter.online';

export type ApiResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; status: number };

let _logoutHandler: (() => Promise<void>) | null = null;
let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

export const setLogoutHandler = (fn: () => Promise<void>) => {
  _logoutHandler = fn;
};

async function clearSession() {
  await deleteSecure('auth_token');
  await deleteSecure('auth_refresh_token');
  await deleteSecure('auth_user');
  if (_logoutHandler) await _logoutHandler();
}

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = await getSecure('auth_refresh_token');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    await saveSecure('auth_token', data.data.token);
    await saveSecure('auth_refresh_token', data.data.refreshToken);
    return data.data.token;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: any,
  options: { timeout?: number } = {},
  retry = false,
): Promise<ApiResult<T>> {
  try {
    const token = await getSecure('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), options.timeout ?? 30000);

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(tid);
    }

    const text = await res.text();
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { parsed = { message: text }; }

    // Token expired — attempt refresh once
    if ((res.status === 401 || res.status === 403) && !retry) {
      if (_isRefreshing) {
        const newToken = await new Promise<string | null>(r => _refreshQueue.push(r));
        if (newToken) return request(method, endpoint, body, options, true);
        await clearSession();
        return { success: false, error: 'Session expired', status: 401 };
      }
      _isRefreshing = true;
      const newToken = await attemptRefresh();
      _isRefreshing = false;
      _refreshQueue.forEach(r => r(newToken));
      _refreshQueue = [];
      if (newToken) return request(method, endpoint, body, options, true);
      await clearSession();
      return { success: false, error: 'Session expired', status: 401 };
    }

    if (!res.ok) {
      // express-validator's 400s put the actual reason in errors[0].msg, not
      // the generic top-level "Validation failed." message — prefer it.
      const validationMsg = Array.isArray(parsed.errors) ? parsed.errors[0]?.msg : undefined;
      const errorMsg = validationMsg || parsed.message || parsed.error || `HTTP ${res.status}`;
      console.warn(`[api] ${method} ${endpoint} → ${res.status}`, errorMsg);
      return {
        success: false,
        error: errorMsg,
        status: res.status,
      };
    }

    console.log(`[api] ${method} ${endpoint} → ${res.status}`);
    return { success: true, data: parsed.data ?? parsed };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn(`[api] ${method} ${endpoint} → timeout`);
      return { success: false, error: 'Request timed out', status: 0 };
    }
    console.warn(`[api] ${method} ${endpoint} → network error`, err?.message);
    return { success: false, error: err.message || 'Network error', status: 0 };
  }
}

const api = {
  get:    <T = any>(endpoint: string, options?: { timeout?: number }) =>
    request<T>('GET', endpoint, undefined, options),
  post:   <T = any>(endpoint: string, body?: any, options?: { timeout?: number }) =>
    request<T>('POST', endpoint, body, options),
  put:    <T = any>(endpoint: string, body?: any, options?: { timeout?: number }) =>
    request<T>('PUT', endpoint, body, options),
  delete: <T = any>(endpoint: string) =>
    request<T>('DELETE', endpoint),
};

export default api;
