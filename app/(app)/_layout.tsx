import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import TabBar from '../../components/common/TabBar';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
      <TabBar />
    </View>
  );
}
