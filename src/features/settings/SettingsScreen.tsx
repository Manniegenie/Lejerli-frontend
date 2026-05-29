import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../app/_layout';

const Rule = () => <View style={s.rule} />;

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.content}>
        <Text style={s.pageLabel}>PROFILE</Text>

        <Rule />

        <View style={s.row}>
          <Text style={s.rowLabel}>USERNAME</Text>
          <Text style={s.rowValue}>{user?.username ?? '—'}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.rowLabel}>EMAIL</Text>
          <Text style={s.rowValue}>{user?.email ?? '—'}</Text>
        </View>

        <Rule />

        <TouchableOpacity style={s.signOutRow} onPress={logout} activeOpacity={0.6}>
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0a0a0a' },
  content:     { flex: 1, paddingHorizontal: 24, paddingTop: 32 },

  pageLabel:   { fontSize: 11, color: '#999999', letterSpacing: 1.8, marginBottom: 0 },

  rule:        { height: 1, backgroundColor: '#1a1a1a', marginVertical: 20 },

  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 12 },
  rowLabel:    { fontSize: 11, color: '#999999', letterSpacing: 1.4 },
  rowValue:    { fontSize: 14, color: '#ffffff' },

  signOutRow:  { paddingVertical: 14 },
  signOutText: { fontSize: 13, color: '#bbbbbb' },
});
