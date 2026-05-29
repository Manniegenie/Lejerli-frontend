import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from './EmptyState';

export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.content}>
        <EmptyState message={title} sub="Coming soon" />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
