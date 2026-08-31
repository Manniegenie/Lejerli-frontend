import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={s.content}>
        <Text style={[s.pageLabel, { color: colors.textSecondary }]}>PROFILE</Text>

        <View style={[s.rule, { backgroundColor: colors.border }]} />

        <View style={s.row}>
          <Text style={[s.rowLabel, { color: colors.textSecondary }]}>NAME</Text>
          <Text style={[s.rowValue, { color: colors.text }]}>{user?.displayName ?? '—'}</Text>
        </View>
        <View style={s.row}>
          <Text style={[s.rowLabel, { color: colors.textSecondary }]}>EMAIL</Text>
          <Text style={[s.rowValue, { color: colors.text }]}>{user?.email ?? '—'}</Text>
        </View>

        <View style={[s.rule, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={s.signOutRow} onPress={logout} activeOpacity={0.6}>
          <Text style={[s.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  content:     { flex: 1, paddingHorizontal: 24, paddingTop: 32 },

  pageLabel:   { fontSize: 11, letterSpacing: 1.8, marginBottom: 0 },

  rule:        { height: 1, marginVertical: 20 },

  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: 12 },
  rowLabel:    { fontSize: 11, letterSpacing: 1.4 },
  rowValue:    { fontSize: 14 },

  signOutRow:  { paddingVertical: 14 },
  signOutText: { fontSize: 13 },
});
