import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

type Size = 'sm' | 'md';

interface EmptyStateProps {
  message: string;
  sub?: string;
  size?: Size;
  onPress?: () => void;
  actionLabel?: string;
  Illustration?: React.ReactNode;
}

function EmptyIcon({ size, stroke }: { size: Size; stroke: string }) {
  const sm = size === 'sm';
  const dim = sm ? 32 : 52;
  const sw = 1.2;
  return (
    <Svg width={dim} height={dim} viewBox="0 0 52 52" fill="none">
      <Rect x="6" y="10" width="40" height="32" rx="3" stroke={stroke} strokeWidth={sw} strokeDasharray="4 3" />
      <Line x1="14" y1="26" x2="38" y2="26" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="14" y1="33" x2="28" y2="33" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="14" y1="19" x2="24" y2="19" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

export default function EmptyState({
  message,
  sub,
  size = 'md',
  onPress,
  actionLabel,
  Illustration,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const sm = size === 'sm';

  return (
    <View style={[s.wrap, sm ? s.wrapSm : s.wrapMd]}>
      {Illustration ?? <EmptyIcon size={size} stroke={colors.border} />}
      <Text style={[s.message, { color: colors.textSecondary }, sm && s.messageSm]}>{message}</Text>
      {sub ? <Text style={[s.sub, { color: colors.textSecondary }, sm && s.subSm]}>{sub}</Text> : null}
      {onPress && actionLabel ? (
        <TouchableOpacity style={[s.btn, { borderColor: colors.border }, sm && s.btnSm]} onPress={onPress} activeOpacity={0.7}>
          <Text style={[s.btnText, { color: colors.textSecondary }, sm && s.btnTextSm]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { alignItems: 'center' },
  wrapMd:     { paddingVertical: 48, paddingHorizontal: 24 },
  wrapSm:     { paddingVertical: 20, paddingHorizontal: 8 },

  message:    { fontSize: 13, marginTop: 14, textAlign: 'center', letterSpacing: 0.2 },
  messageSm:  { fontSize: 12, marginTop: 10 },

  sub:        { fontSize: 12, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  subSm:      { fontSize: 11, marginTop: 4 },

  btn:        { marginTop: 20, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  btnSm:      { marginTop: 12, paddingHorizontal: 14, paddingVertical: 7 },
  btnText:    { fontSize: 13, letterSpacing: 0.3 },
  btnTextSm:  { fontSize: 12 },
});
