import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Linking } from 'react-native';
import { NewsItem } from '../../../services/newsService';

interface Props {
  newsItem: NewsItem | null;
  opacity: Animated.Value;
}

export default function NewsBanner({ newsItem, opacity }: Props) {
  if (!newsItem) return null;

  const handlePress = () => {
    if (newsItem.link) Linking.openURL(newsItem.link).catch(() => {});
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={s.wrapper}>
      <View style={s.header}>
        <View style={s.badge}>
          <Text style={s.badgeText}>LIVE</Text>
        </View>
        <Text style={s.source}>{newsItem.source}</Text>
      </View>
      <Animated.Text style={[s.title, { opacity }]} numberOfLines={2}>
        {newsItem.title}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: '#110a04',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,101,34,0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#F26522',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(242,101,34,0.15)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F26522',
    letterSpacing: 1.2,
  },
  source: {
    fontSize: 12,
    color: '#666666',
  },
  title: {
    fontSize: 14,
    color: '#dddddd',
    lineHeight: 20,
  },
});
