import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function ErrorScreen({ error }: { error: Error }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        <Text style={[s.code, { color: colors.border }]}>500</Text>
        <Text style={[s.title, { color: colors.text }]}>Something went wrong</Text>
        <Text style={[s.message, { color: colors.textSecondary }]}>{error?.message || 'An unexpected error occurred.'}</Text>
        <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <Text style={s.btnText}>Go home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  code:      { fontSize: 72, fontWeight: '700', marginBottom: 8 },
  title:     { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  message:   { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  btn:       { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText:   { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
