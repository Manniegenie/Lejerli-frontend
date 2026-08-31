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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import authService from '../../services/authService';
import desksService from '../../services/desksService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  const { email: prefillEmail, inviteToken } = useLocalSearchParams<{ email?: string; inviteToken?: string }>();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const isValid = isEmailValid && isPasswordValid && passwordsMatch;

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    const res = await authService.signup(email.trim(), password, displayName.trim());
    if (!res.success || !res.data) {
      setLoading(false);
      setError(res.error || 'Could not create account.');
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
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={s.content}>
            <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

            <Text style={s.title}>Create your account</Text>
            <Text style={s.subtitle}>Set up your desk on Lejerli.</Text>

            <Text style={s.label}>NAME</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={[s.label, s.labelSpaced]}>WORK EMAIL</Text>
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
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                returnKeyType="next"
              />
            </View>
            {password.length === 0 ? (
              <Text style={s.hintText}>Must be at least 8 characters.</Text>
            ) : !isPasswordValid ? (
              <Text style={s.hintText}>{8 - password.length} more character{8 - password.length === 1 ? '' : 's'} needed.</Text>
            ) : null}

            <Text style={[s.label, s.labelSpaced]}>CONFIRM PASSWORD</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {confirmPassword.length > 0 && !passwordsMatch ? (
              <Text style={s.errorText}>Passwords don't match.</Text>
            ) : null}
            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.button, (!isValid || loading) && s.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={s.buttonText}>Create account</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.signupLink}
              onPress={() => router.replace({ pathname: '/(auth)/login', params: { email: email.trim(), inviteToken } })}
              activeOpacity={0.7}
            >
              <Text style={s.signupLinkText}>
                Already have an account? <Text style={s.signupLinkTextBold}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    content: {
      paddingHorizontal: 28,
      paddingVertical: 24,
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
    hintText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
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
