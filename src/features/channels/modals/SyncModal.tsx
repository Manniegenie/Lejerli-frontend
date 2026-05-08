import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Switch,
} from 'react-native';

interface Props {
  visible: boolean;
  exchangeName: string;
  onClose: () => void;
  onConfirm: (permissions: { trades: boolean; deposits: boolean; withdrawals: boolean }) => Promise<void>;
}

export default function SyncModal({ visible, exchangeName, onClose, onConfirm }: Props) {
  const [trades, setTrades] = useState(true);
  const [deposits, setDeposits] = useState(true);
  const [withdrawals, setWithdrawals] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm({ trades, deposits, withdrawals });
      onClose();
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />

        <Text style={s.title}>Sync {exchangeName}</Text>
        <Text style={s.subtitle}>Choose what data to import from the last 12 months</Text>

        <View style={s.options}>
          <OptionRow label="Trading History" sub="All spot trades" value={trades} onChange={setTrades} />
          <OptionRow label="Deposits" sub="Fiat & crypto deposits" value={deposits} onChange={setDeposits} />
          <OptionRow label="Withdrawals" sub="Fiat & crypto withdrawals" value={withdrawals} onChange={setWithdrawals} />
        </View>

        <TouchableOpacity
          style={[s.confirmBtn, loading && s.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.confirmText}>Start Sync</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function OptionRow({
  label, sub, value, onChange,
}: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.optionRow}>
      <View style={s.optionText}>
        <Text style={s.optionLabel}>{label}</Text>
        <Text style={s.optionSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#2a2a2a', true: 'rgba(242,101,34,0.5)' }}
        thumbColor={value ? '#F26522' : '#555555'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  backdrop:          { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:             { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle:            { width: 36, height: 4, borderRadius: 2, backgroundColor: '#333333', alignSelf: 'center', marginBottom: 24 },
  title:             { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 6 },
  subtitle:          { fontSize: 13, color: '#666666', marginBottom: 28 },
  options:           { gap: 4, marginBottom: 28 },
  optionRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  optionText:        { flex: 1, gap: 3 },
  optionLabel:       { fontSize: 15, fontWeight: '500', color: '#ffffff' },
  optionSub:         { fontSize: 12, color: '#555555' },
  confirmBtn:        { height: 54, backgroundColor: '#F26522', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  confirmBtnDisabled:{ opacity: 0.6 },
  confirmText:       { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  cancelBtn:         { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText:        { fontSize: 15, color: '#666666' },
});
