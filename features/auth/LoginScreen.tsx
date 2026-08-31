import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import authService from '../../services/authService';
import desksService from '../../services/desksService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  const { email: prefillEmail, inviteToken } = useLocalSearchParams<{ email?: string; inviteToken?: string }>();
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    const res = await authService.login(email.trim(), password);
    if (!res.success || !res.data) {
      setLoading(false);
      setError(res.error || 'Could not sign in.');
      return;
    }

    login(
      {
        id: res.data.id,
        email: res.data.email,
        displayName: res.data.displayName,
        verificationTier: res.data.verificationTier,
      },
      res.data.token
    );

    if (inviteToken) {
      const acceptRes = await desksService.acceptInvite(inviteToken);
      setLoading(false);
      if (acceptRes.success && acceptRes.data.type === 'PARTNER' && acceptRes.data.room) {
        router.replace({ pathname: '/(app)/chats/[id]', params: { id: acceptRes.data.room._id, kind: 'ROOM' } });
      } else {
        router.replace('/(app)/chats');
      }
      return;
    }

    setLoading(false);
    router.replace('/(app)/chats');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.content}>
          <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

          <Text style={s.title}>Sign in to Lejerli</Text>
          <Text style={s.subtitle}>Enter your email and password to continue.</Text>

          <Text style={s.label}>WORK EMAIL</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="you@yourdesk.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <Text style={[s.label, s.labelSpaced]}>PASSWORD</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.button, (!isValid || loading) && s.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={s.buttonText}>Sign in</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.signupLink}
            onPress={() => router.push({ pathname: '/(auth)/signup', params: { email: email.trim(), inviteToken } })}
            activeOpacity={0.7}
          >
            <Text style={s.signupLinkText}>
              Don't have an account? <Text style={s.signupLinkTextBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      maxWidth: 420,
      width: '100%',
      alignSelf: 'center',
    },
    logo: {
      width: 120,
      height: 21,
      marginBottom: 40,
    },
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
    label: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    labelSpaced: {
      marginTop: 20,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      height: 52,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      height: '100%',
      outlineStyle: 'none' as any,
      outlineWidth: 0,
    },
    errorText: {
      fontSize: 12,
      color: colors.danger,
      marginTop: 10,
    },
    button: {
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    buttonDisabled: {
      backgroundColor: colors.primaryMuted,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
    signupLink: {
      marginTop: 20,
      alignItems: 'center',
    },
    signupLinkText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    signupLinkTextBold: {
      color: colors.primary,
      fontWeight: '600',
    },
  });
}
