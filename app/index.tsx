import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from './_layout';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#0a0a0a';
      document.body.style.backgroundColor = '#0a0a0a';
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace('/(app)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color="#F26522" />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
});
