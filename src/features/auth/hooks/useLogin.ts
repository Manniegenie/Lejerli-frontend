import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading as setGlobalLoading } from '../../../store/authSlice';
import authService from '../../../services/authService';

export function useLogin() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (): Promise<boolean> => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return false;
    }
    setError(null);
    setLoading(true);
    dispatch(setGlobalLoading(true));
    try {
      const res = await authService.login({ email: email.trim(), password });
      if (res.success) {
        dispatch(setCredentials({
          user: { id: res.data.id, email: res.data.email, username: res.data.username },
          token: res.data.token,
        }));
        return true;
      }
      setError(res.message || 'Login failed.');
      return false;
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
    }
  };

  return { email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, login };
}
