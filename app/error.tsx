import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ErrorScreen({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.code}>500</Text>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.message}>{error?.message || 'An unexpected error occurred.'}</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <Text style={s.btnText}>Go home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  code:      { fontSize: 72, fontWeight: '700', color: '#1e1e1e', marginBottom: 8 },
  title:     { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 12, textAlign: 'center' },
  message:   { fontSize: 14, color: '#999999', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  btn:       { backgroundColor: '#F26522', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText:   { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
