import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../app/_layout';
import api from '../../services/api';

export default function TwoFactorScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { email = '', token = '' } = useLocalSearchParams<{ email: string; token: string }>();

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
    const res = await api.post('/2fa/verify', { email, otp: fullCode, token });
    setLoading(false);
    if (res.success && res.data?.token) {
      const { id, email: userEmail, username, token: authToken } = res.data;
      login({ id, email: userEmail, username }, authToken);
      router.replace('/(app)/dashboard');
    } else {
      Alert.alert('Verification Failed', res.success ? 'Invalid code' : (res as any).error || 'Invalid code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Left panel */}
      <View style={styles.leftPanel}>
        <Image source={require('../../../assets/skyscrapper.jpg')} style={styles.bgImage} resizeMode="cover" />
      </View>

      {/* Black space — centers the form within remaining area */}
      <View style={styles.blackSpace}>
      <View style={styles.rightPanel}>
        <View style={styles.content}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Two-factor auth</Text>

          <Text style={styles.subtitle}>
            Open Google Authenticator or Authy and enter the 6-digit code.
          </Text>

          {/* OTP inputs */}
          <View style={styles.otpRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                placeholderTextColor="#555"
                placeholder="·"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, (!isComplete || loading) && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Verify  →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.backRow}>
            <Text style={styles.backText}>
              Back to <Text style={styles.backLink}>LOGIN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
  },
  leftPanel: {
    width: 703,
    height: 1289,
    overflow: 'hidden',
  },
  bgImage: {
    width: 703,
    height: 1289,
  },
  blackSpace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPanel: {
    width: 775,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 48,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 164,
    height: 28.72,
    marginBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 44,
    fontFamily: 'GeneralSans',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#bbbbbb',
    marginBottom: 28,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  otpInput: {
    width: 20,
    flex: 1,
    height: 64,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  button: {
    width: '100%',
    height: 67,
    backgroundColor: '#F26522',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#F9B697',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backRow: {
    alignItems: 'center',
  },
  backText: {
    fontSize: 13,
    color: '#888',
  },
  backLink: {
    color: '#F26522',
    fontWeight: '700',
  },
});
