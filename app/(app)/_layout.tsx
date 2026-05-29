import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../_layout';
import TabBar from '../../src/components/common/TabBar';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <Stack screenOptions={{ headerShown: false }} />
      <TabBar />
    </View>
  );
}
