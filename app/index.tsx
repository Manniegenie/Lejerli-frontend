import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = colors.background;
      document.body.style.backgroundColor = colors.background;
    }
  }, [colors.background]);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace('/(app)/chats');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
