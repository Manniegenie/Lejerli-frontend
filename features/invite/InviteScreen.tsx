import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import desksService, { InviteDetail } from '../../services/desksService';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

type Status = 'loading' | 'ready' | 'not_found' | 'expired' | 'accepted' | 'mismatch' | 'accepting' | 'error';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [status, setStatus] = useState<Status>('loading');
  const [detail, setDetail] = useState<InviteDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const acceptForAuthenticatedUser = useCallback(async () => {
    if (!token) return;
    setStatus('accepting');
    const res = await desksService.acceptInvite(token);
    if (res.success) {
      if (res.data.type === 'PARTNER' && res.data.room) {
        router.replace({ pathname: '/(app)/chats/[id]', params: { id: res.data.room._id, kind: 'ROOM' } });
      } else {
        router.replace('/(app)/chats');
      }
    } else {
      setStatus('error');
      setErrorMsg((res as any).error || 'Could not accept this invite.');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token || authLoading) return;

    let cancelled = false;

    async function load() {
      const res = await desksService.getInvite(token);
      if (cancelled) return;

      if (!res.success) {
        const status = (res as any).status;
        setStatus(status === 410 ? 'expired' : status === 409 ? 'accepted' : 'not_found');
        return;
      }

      setDetail(res.data);

      if (isAuthenticated && user) {
        if (user.email.toLowerCase() === res.data.targetEmail.toLowerCase()) {
          acceptForAuthenticatedUser();
        } else {
          setStatus('mismatch');
        }
      } else {
        setStatus('ready');
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, isAuthenticated, user]);

  const handleContinue = async () => {
    if (!detail || !token) return;
    setStatus('accepting');
    const res = await authService.requestOtp(detail.targetEmail);
    if (res.success) {
      router.replace({ pathname: '/(auth)/verification', params: { email: detail.targetEmail, inviteToken: token } });
    } else {
      setStatus('error');
      setErrorMsg(res.error || 'Could not send a verification code.');
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    setStatus('loading');
  };

  const inviteKindCopy = (type: 'FLOOR' | 'PARTNER') =>
    type === 'FLOOR'
      ? "You've been invited to join the floor."
      : "You've been invited to connect as a trading counterparty.";

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <View style={s.content}>
        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

        {(status === 'loading' || authLoading || status === 'accepting') && (
          <View style={s.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {status === 'ready' && detail && (
          <>
            <Text style={s.title}>{detail.deskName}</Text>
            <Text style={s.subtitle}>
              {detail.inviterName ? `${detail.inviterName} — ` : ''}{inviteKindCopy(detail.type)}
            </Text>
            <TouchableOpacity style={s.button} onPress={handleContinue} activeOpacity={0.85}>
              <Text style={s.buttonText}>Continue with {detail.targetEmail}</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'mismatch' && detail && (
          <>
            <Text style={s.title}>Wrong account</Text>
            <Text style={s.subtitle}>
              This invite was sent to {detail.targetEmail}, but you're signed in as {user?.email}.
            </Text>
            <TouchableOpacity style={s.button} onPress={handleSwitchAccount} activeOpacity={0.85}>
              <Text style={s.buttonText}>Sign out and try again</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'not_found' && (
          <>
            <Text style={s.title}>Invite not found</Text>
            <Text style={s.subtitle}>This invite link isn't valid. Ask for a new one.</Text>
          </>
        )}

        {status === 'expired' && (
          <>
            <Text style={s.title}>Invite expired</Text>
            <Text style={s.subtitle}>This invite is no longer valid. Ask for a new one.</Text>
          </>
        )}

        {status === 'accepted' && (
          <>
            <Text style={s.title}>Already accepted</Text>
            <Text style={s.subtitle}>This invite has already been used.</Text>
            <TouchableOpacity style={s.button} onPress={() => router.replace(isAuthenticated ? '/(app)/chats' : '/(auth)/login')} activeOpacity={0.85}>
              <Text style={s.buttonText}>{isAuthenticated ? 'Go to Chats' : 'Sign in'}</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={s.title}>Something went wrong</Text>
            <Text style={s.subtitle}>{errorMsg}</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      maxWidth: 420,
      width: '100%',
      alignSelf: 'center',
    },
    centered: { paddingVertical: 40, alignItems: 'center' },
    logo: { width: 120, height: 21, marginBottom: 40 },
    title: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 32,
      fontFamily: 'GeneralSans',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 32,
    },
    button: {
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
