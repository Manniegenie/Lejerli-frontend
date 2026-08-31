import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import desksService, { Desk } from '../../services/desksService';
import EmptyState from '../../components/common/EmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function DesksListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [desks, setDesks]     = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError]     = useState('');
  const nameRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
    const res = await desksService.getMyDesks();
    if (res.success) {
      setDesks(res.data);
    } else {
      setError('Could not load desks.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (name.length < 2) { setError('Name must be at least 2 characters.'); return; }
    setCreating(true);
    setError('');
    const res = await desksService.createDesk(name);
    setCreating(false);
    if (res.success) {
      setDesks(prev => [...prev, res.data]);
      setModalVisible(false);
      setNewName('');
      router.push(`/(app)/desks/${res.data._id}`);
    } else {
      setError((res as any).error ?? 'Failed to create desk.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Desks</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
          <Text style={s.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={s.divider} />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : desks.length === 0 ? (
        <View style={s.empty}>
          <EmptyState
            message="No desks yet"
            sub="Create a desk to bring your team and counterparties together."
            onPress={() => setModalVisible(true)}
            actionLabel="Create Desk"
          />
        </View>
      ) : (
        <FlatList
          data={desks}
          keyExtractor={d => d._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.row}
              onPress={() => router.push(`/(app)/desks/${item._id}`)}
              activeOpacity={0.7}
            >
              <View style={s.rowIcon}>
                <Text style={s.rowIconText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.rowMeta}>
                <Text style={s.rowName}>{item.name}</Text>
                <Text style={s.rowSub}>Tier {item.verificationTier}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>New Desk</Text>

            <Text style={s.modalLabel}>DESK NAME</Text>
            <TextInput
              ref={nameRef}
              style={s.modalInput}
              placeholder="e.g. NY Rates Desk"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            {error ? <Text style={s.modalError}>{error}</Text> : null}

            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => { setModalVisible(false); setError(''); }}
                activeOpacity={0.7}
              >
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.createBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.createText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe:      { flex: 1, backgroundColor: colors.background },
    centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
    divider:   { height: 1, backgroundColor: colors.border },
    sep:       { height: 1, backgroundColor: colors.border, marginLeft: 64 },

    header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    title:     { fontSize: 20, fontWeight: '700', color: colors.text },
    newBtn:      { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    newBtnText:  { fontSize: 13, fontWeight: '600', color: '#ffffff' },

    empty:     { flex: 1, justifyContent: 'center' },

    row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    rowIcon:     { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    rowIconText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
    rowMeta:     { flex: 1 },
    rowName:     { fontSize: 15, color: colors.text, fontWeight: '500', marginBottom: 3 },
    rowSub:      { fontSize: 12, color: colors.textSecondary },

    modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet:    { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
    modalTitle:    { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 24 },
    modalLabel:    { fontSize: 10, color: colors.textSecondary, letterSpacing: 1.4, marginBottom: 8 },
    modalInput:    { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    modalError:    { fontSize: 12, color: colors.danger, marginBottom: 12 },
    modalActions:  { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    cancelText:    { fontSize: 14, color: colors.textSecondary },
    createBtn:     { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' },
    createText:    { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  });
}
