import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ClockEntry } from '../../../services/clockService';

interface Props {
  clocks: ClockEntry[];
}

export default function ClocksStrip({ clocks }: Props) {
  if (!clocks.length) return null;

  return (
    <View>
      <Text style={s.sectionTitle}>World Clocks</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {clocks.map((c, i) => (
          <View key={i} style={s.card}>
            <Text style={s.time}>{c.time}</Text>
            <Text style={s.city}>{c.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    marginHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    alignItems: 'center',
    minWidth: 80,
  },
  time: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  city: {
    fontSize: 11,
    color: '#555555',
  },
});
