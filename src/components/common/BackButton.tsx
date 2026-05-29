import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  onPress?: () => void;
  style?: any;
}

export default function BackButton({ onPress, style }: BackButtonProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[s.btn, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Image source={require('../../../assets/backy.png')} style={s.icon} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn:  { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  icon: { width: 24, height: 24, resizeMode: 'contain', tintColor: '#ffffff' },
});
