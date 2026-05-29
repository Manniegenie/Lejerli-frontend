import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../app/_layout';
import authService from '../../../services/authService';

export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<boolean> => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return false;
    }
    setError(null);
    setLoading(true);
    const res = await authService.login({ email: email.trim(), password });
    setLoading(false);
    if (res.success && res.data) {
      login(
        { id: res.data.id, email: res.data.email, username: res.data.username },
        res.data.token,
      );
      router.replace('/(app)/dashboard');
      return true;
    }
    setError(res.error || 'Login failed.');
    return false;
  };

  return { email, setEmail, password, setPassword, showPassword, setShowPassword, loading, error, login: handleLogin };
}
