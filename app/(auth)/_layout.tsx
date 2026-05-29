import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../_layout';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
