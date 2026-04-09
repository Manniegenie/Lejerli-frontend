import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import newsService, { NewsItem } from '../services/newsService';

export function useNews() {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const newsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;

    const cycle = async () => {
      const item = await newsService.getNews();
      if (!mounted) return;

      // Fade out → swap → fade in
      Animated.timing(newsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        if (mounted) {
          setNewsItem(item);
          Animated.timing(newsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
      });
    };

    cycle();
    const id = setInterval(cycle, 8000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return { newsItem, newsOpacity };
}
