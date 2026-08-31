import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import BackButton from '../../components/common/BackButton';
import desksService from '../../services/desksService';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function DeskDetailScreen() {
  const { id: deskId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [memberEmail, setMemberEmail]   = useState('');
  const [memberBusy, setMemberBusy]     = useState(false);
  const [memberMsg, setMemberMsg]       = useState('');
  const [memberErr, setMemberErr]       = useState(false);

  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerBusy, setPartnerBusy]   = useState(false);
  const [partnerMsg, setPartnerMsg]     = useState('');
  const [partnerErr, setPartnerErr]     = useState(false);

  const handleAddMember = async () => {
    const email = memberEmail.trim();
    if (!email || !deskId) return;
    setMemberBusy(true);
    setMemberMsg('');
    const res = await desksService.inviteFloorMember(deskId, email);
    setMemberBusy(false);
    if (res.success) {
      setMemberErr(false);
      setMemberMsg(`Invitation sent to ${email}.`);
      setMemberEmail('');
    } else {
      setMemberErr(true);
      setMemberMsg((res as any).error ?? 'Failed to send invite.');
    }
  };

  const handleConnectPartner = async () => {
    const email = partnerEmail.trim();
    if (!email || !deskId) return;
    setPartnerBusy(true);
    setPartnerMsg('');
    const res = await desksService.invitePartner(deskId, email);
    setPartnerBusy(false);
    if (res.success) {
      setPartnerErr(false);
      setPartnerMsg(`Invitation sent to ${email}.`);
      setPartnerEmail('');
    } else {
      setPartnerErr(true);
      setPartnerMsg((res as any).error ?? 'Failed to send invite.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <BackButton />
        <Text style={s.headerTitle}>Desk</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.sectionLabel}>INVITE FLOOR MEMBER</Text>
          <Text style={s.sectionSub}>
            Invite an internal team member by email. They don't need an existing account —
            we'll send a link that lets them join, whether or not they've used Lejerli before.
          </Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="teammate@yourdesk.com"
              placeholderTextColor={colors.textSecondary}
              value={memberEmail}
              onChangeText={setMemberEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleAddMember}
            />
            <TouchableOpacity
              style={[s.actionBtn, (!memberEmail.trim() || memberBusy) && s.actionBtnDisabled]}
              onPress={handleAddMember}
              disabled={!memberEmail.trim() || memberBusy}
              activeOpacity={0.8}
            >
              {memberBusy
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.actionBtnText}>Invite</Text>}
            </TouchableOpacity>
          </View>
          {memberMsg ? (
            <Text style={[s.feedback, memberErr && s.feedbackError]}>{memberMsg}</Text>
          ) : null}

          <View style={s.rule} />

          <Text style={s.sectionLabel}>INVITE PARTNER</Text>
          <Text style={s.sectionSub}>
            Invite an external counterparty by email. Once they accept, a trading room opens
            automatically — no account required up front.
          </Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="partner@counterparty.com"
              placeholderTextColor={colors.textSecondary}
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleConnectPartner}
            />
            <TouchableOpacity
              style={[s.actionBtn, (!partnerEmail.trim() || partnerBusy) && s.actionBtnDisabled]}
              onPress={handleConnectPartner}
              disabled={!partnerEmail.trim() || partnerBusy}
              activeOpacity={0.8}
            >
              {partnerBusy
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.actionBtnText}>Invite</Text>}
            </TouchableOpacity>
          </View>
          {partnerMsg ? (
            <Text style={[s.feedback, partnerErr && s.feedbackError]}>{partnerMsg}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },

    header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },

    content: { padding: 24 },

    sectionLabel: { fontSize: 11, letterSpacing: 1.4, color: colors.textSecondary, marginBottom: 6, fontWeight: '600' },
    sectionSub:   { fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 18 },

    inputRow: { flexDirection: 'row', gap: 10 },
    input:    { flex: 1, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, height: 48, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border },
    actionBtn:         { paddingHorizontal: 18, height: 48, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    actionBtnDisabled: { backgroundColor: colors.surfaceAlt },
    actionBtnText:     { fontSize: 14, fontWeight: '600', color: '#ffffff' },

    feedback:      { fontSize: 12, color: colors.success, marginTop: 10 },
    feedbackError: { color: colors.danger },

    rule: { height: 1, backgroundColor: colors.border, marginVertical: 28 },
  });
}
