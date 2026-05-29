import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConnected: () => void;
}

function CryptoIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#F26522" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M2 17l10 5 10-5" stroke="#F26522" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M2 12l10 5 10-5" stroke="#F26522" strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

function FiatIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="20" height="14" rx="2" stroke="#F26522" strokeWidth={1.5} />
      <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#F26522" strokeWidth={1.5} />
      <Circle cx="12" cy="14" r="2" stroke="#F26522" strokeWidth={1.5} />
    </Svg>
  );
}

export default function ConnectModal({ visible, onClose }: Props) {
  const router = useRouter();

  const pick = (tree: 'crypto' | 'fiat') => {
    onClose();
    router.push({ pathname: '/(app)/channels/pick', params: { tree } });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <Text style={s.title}>Connect Channel</Text>
        <Text style={s.subtitle}>What type of channel would you like to add?</Text>

        <View style={s.row}>
          <TouchableOpacity style={s.card} onPress={() => pick('crypto')} activeOpacity={0.8}>
            <CryptoIcon />
            <Text style={s.cardTitle}>Crypto</Text>
            <Text style={s.cardSub}>CEX exchanges{'\n'}& DEX wallets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.card} onPress={() => pick('fiat')} activeOpacity={0.8}>
            <FiatIcon />
            <Text style={s.cardTitle}>Fiat</Text>
            <Text style={s.cardSub}>Bank accounts{'\n'}& payment rails</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  handle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: '#2a2a2a', alignSelf: 'center', marginBottom: 24 },
  title:     { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  subtitle:  { fontSize: 13, color: '#666666', marginBottom: 28 },
  row:       { flexDirection: 'row', gap: 14 },
  card:      { flex: 1, backgroundColor: '#0f0f0f', borderRadius: 16, borderWidth: 1, borderColor: '#1e1e1e', padding: 22, alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  cardSub:   { fontSize: 11, color: '#555555', textAlign: 'center', lineHeight: 17 },
});
