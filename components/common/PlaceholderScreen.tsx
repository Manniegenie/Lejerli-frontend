import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from './EmptyState';
import { useTheme } from '../../contexts/ThemeContext';

export default function PlaceholderScreen({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={s.content}>
        <EmptyState message={title} sub="Coming soon" />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
