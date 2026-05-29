import api from './api';

export interface WalletSnapshot {
  totalUSD: string | null;
  assetCount: number;
  canTrade: boolean | null;
  lastUpdated: string | null;
}

export interface WalletStatusEntry {
  connected: boolean;
  connectedAt: string | null;
  lastSynced: string | null;
  snapshot: WalletSnapshot | null;
}

export interface BalanceEntry {
  asset: string;
  free: string;
  locked: string;
  usdValue: string;
}

const walletService = {
  getStatus: () => api.get<Record<string, WalletStatusEntry>>('/wallet/status'),
  getBalances: (exchange: string) => api.get<BalanceEntry[]>(`/wallet/balances/${exchange}`),
  connect: (exchange: string, apiKey: string, apiSecret: string) =>
    api.post(`/wallet/${exchange}`, { apiKey, apiSecret }),
  connectDex: (exchange: string, walletAddress: string) =>
    api.post(`/wallet/${exchange}`, { walletAddress }),
  disconnect: (exchange: string) => api.delete(`/wallet/${exchange}`),
};

export default walletService;
