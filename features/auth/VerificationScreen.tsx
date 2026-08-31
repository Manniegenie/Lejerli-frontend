import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import desksService from '../../services/desksService';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../constants/theme';

export default function VerificationScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { email = '', inviteToken } = useLocalSearchParams<{ email: string; inviteToken?: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...code];
    updated[index] = digit;
    setCode(updated);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join('');
  const isComplete = fullCode.length === 6;

  const handleVerify = async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    const res = await authService.verifyOtp(email, fullCode);
    if (!res.success || !res.data) {
      setLoading(false);
      Alert.alert('Verification Failed', res.error || 'Invalid code');
      return;
    }

    const { id, email: userEmail, displayName, verificationTier, token } = res.data;
    login({ id, email: userEmail, displayName, verificationTier }, token);

    if (inviteToken) {
      const acceptRes = await desksService.acceptInvite(inviteToken);
      setLoading(false);
      if (acceptRes.success && acceptRes.data.type === 'PARTNER' && acceptRes.data.room) {
        router.replace({ pathname: '/(app)/chats/[id]', params: { id: acceptRes.data.room._id, kind: 'ROOM' } });
      } else {
        // Floor invite, or partner-accept failed after login succeeded (e.g.
        // invite already used/expired) — either way land on Chats; the desk's
        // floor channel (or an error toast, in the failure case) is one tap away.
        if (!acceptRes.success) {
          Alert.alert('Invite', acceptRes.error || 'Could not accept the invite, but you are signed in.');
        }
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

          <Text style={s.title}>Check your inbox</Text>
          <Text style={s.subtitle}>
            We sent a 6-digit verification code to {email || 'your work email'}. It expires in 10 minutes.
          </Text>

          <View style={s.otpRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={s.otpInput}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                placeholderTextColor={colors.textSecondary}
                placeholder="·"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[s.button, (!isComplete || loading) && s.buttonDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={s.buttonText}>Verify</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={s.backRow}>
            <Text style={s.backText}>
              Wrong email? <Text style={s.backLink}>Start over</Text>
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
    otpRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 24,
    },
    otpInput: {
      flex: 1,
      height: 56,
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      outlineStyle: 'none' as any,
      outlineWidth: 0,
    },
    button: {
      height: 52,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    buttonDisabled: {
      backgroundColor: colors.primaryMuted,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
    backRow: {
      alignItems: 'center',
    },
    backText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    backLink: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
