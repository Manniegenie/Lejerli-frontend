import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onDismiss?: () => void;
  duration?: number;
}

const THEME: Record<ToastType, { color: string; bg: string }> = {
  error:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  info:    { color: '#F26522', bg: 'rgba(242,101,34,0.12)' },
};

export default function Toast({ type = 'error', title, message, onDismiss, duration = 4000 }: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-90)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -90, duration: 225, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 225, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 360, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, []);

  const { color, bg } = THEME[type];

  return (
    <Animated.View style={[s.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={[s.card, { backgroundColor: bg, borderLeftColor: color }]}>
          <Text style={[s.title, { color }]} numberOfLines={2}>{title}</Text>
          {message ? <Text style={s.message} numberOfLines={4}>{message}</Text> : null}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    paddingTop: 54,
    paddingHorizontal: 14,
  },
  card: {
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderLeftWidth: 3.6,
    borderWidth: 0.9,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.6 },
    shadowOpacity: 0.3,
    shadowRadius: 10.8,
    elevation: 7,
    minHeight: 54,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#bbbbbb',
    lineHeight: 16,
  },
});
