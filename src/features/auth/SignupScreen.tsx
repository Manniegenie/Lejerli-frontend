import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import authService from '../../services/authService';
import Toast from '../../components/common/Toast';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid =
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length >= 7 &&
    confirmPassword.length > 0 &&
    agreedToTerms;

  const handleSignup = async () => {
    setError('');
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (password.length < 7) {
      setError('Password must be at least 7 characters'); return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/.test(password)) {
      setError('Password must contain at least one special character'); return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one digit'); return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy'); return;
    }
    setLoading(true);
    const response = await authService.signup({ email, username, password });
    setLoading(false);
    if (response.success) {
      router.push({ pathname: '/(auth)/verification', params: { email } });
    } else {
      setError(response.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={s.container}>
      {error ? <Toast type="error" title={error} onDismiss={() => setError('')} /> : null}
      <KeyboardAvoidingView style={s.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
          <View style={s.content}>

            <View style={s.header}>
              <Text style={s.title}>Create your account</Text>
              <Text style={s.subtitle}>Enter your details to get started</Text>
            </View>

            <View style={s.form}>

              <View style={s.inputContainer}>
                <Text style={s.label}>Work Email</Text>
                <TextInput
                  style={s.input}
                  placeholder="Enter your work email"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Company Name</Text>
                <TextInput
                  style={s.input}
                  placeholder="Enter your company name"
                  placeholderTextColor="#555"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Password</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={s.passwordInput}
                    placeholder="Enter password"
                    placeholderTextColor="#555"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                    <Text style={s.eyeIcon}>{showPassword ? '◉' : '◎'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.hint}>Min 7 characters, include a digit and special character</Text>
              </View>

              <View style={s.inputContainer}>
                <Text style={s.label}>Confirm Password</Text>
                <View style={s.passwordRow}>
                  <TextInput
                    style={s.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#555"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={s.eyeBtn}>
                    <Text style={s.eyeIcon}>{showConfirmPassword ? '◉' : '◎'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={s.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)} activeOpacity={0.7}>
                <View style={[s.checkbox, agreedToTerms && s.checkboxChecked]}>
                  {agreedToTerms && <Text style={s.checkmark}>✓</Text>}
                </View>
                <Text style={s.termsText}>
                  I agree to Lejerli's{' '}
                  <Text style={s.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={s.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.buttonContainer}>
              <TouchableOpacity
                style={[s.button, isFormValid ? s.buttonActive : s.buttonInactive]}
                onPress={handleSignup}
                disabled={!isFormValid || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[s.buttonText, !isFormValid && s.buttonTextInactive]}>
                      Create account
                    </Text>}
              </TouchableOpacity>

              <View style={s.loginContainer}>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7} disabled={loading}>
                  <Text style={s.loginLink}>I already have an account</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a0a' },
  keyboardAvoid:      { flex: 1 },
  scrollView:         { flex: 1 },
  content:            { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  header:             { paddingTop: 40, marginBottom: 32 },
  title:              { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  subtitle:           { fontSize: 15, color: '#bbbbbb' },

  form:               { gap: 20 },



  inputContainer:     { gap: 6 },
  label:              { fontSize: 13, fontWeight: '500', color: '#cccccc' },
  input:              { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: '#ffffff' },

  passwordRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  passwordInput:      { flex: 1, color: '#ffffff', fontSize: 15, height: '100%' },
  eyeBtn:             { padding: 4 },
  eyeIcon:            { fontSize: 18, color: '#999999' },
  hint:               { fontSize: 12, color: '#999999' },

  termsRow:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox:           { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#444', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked:    { backgroundColor: '#F26522', borderColor: '#F26522' },
  checkmark:          { color: '#fff', fontSize: 11, fontWeight: '700' },
  termsText:          { flex: 1, fontSize: 13, color: '#bbbbbb', lineHeight: 20 },
  termsLink:          { color: '#F26522', fontWeight: '500' },

  buttonContainer:    { paddingTop: 32, paddingBottom: 40 },
  button:             { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 16 },
  buttonActive:       { backgroundColor: '#F26522', borderColor: '#F26522' },
  buttonInactive:     { backgroundColor: 'transparent', borderColor: '#2a2a2a' },
  buttonText:         { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  buttonTextInactive: { color: '#999999' },

  loginContainer:     { alignItems: 'center' },
  loginLink:          { fontSize: 15, fontWeight: '500', color: '#F26522', textDecorationLine: 'underline' },
});
