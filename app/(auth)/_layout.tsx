import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/(app)/chats');
    }
  }, [isAuthenticated, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
