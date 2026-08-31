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
import { useRouter } from 'expo-router';
import authService from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = React.useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');
    const res = await authService.requestOtp(email.trim());
    setLoading(false);
    if (res.success) {
      router.push({ pathname: '/(auth)/verification', params: { email: email.trim() } });
    } else {
      setError(res.error || 'Could not send verification code.');
    }
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
          <Text style={s.subtitle}>
            Enter your work email and we'll send you a 6-digit code to sign in.
          </Text>

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
              : <Text style={s.buttonText}>Continue</Text>}
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
  });
}
