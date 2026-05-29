import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLogin } from './hooks/useLogin';
import Toast from '../../components/common/Toast';

export default function LoginScreen() {
  const router = useRouter();
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error, login,
  } = useLogin();

  return (
    <SafeAreaView style={s.safe}>
      {error ? <Toast type="error" title={error} onDismiss={() => {}} /> : null}
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../../assets/logo.png')} style={s.logo} resizeMode="contain" />
          <Text style={s.heading}>Welcome back</Text>
          <Text style={s.subheading}>Your portfolio, one place.</Text>

          <Text style={s.label}>Work Email</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Enter your work email"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Enter your password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={login}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.forgotRow} activeOpacity={0.6}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.loginBtn, loading && s.loginBtnDisabled]}
            onPress={login}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.loginBtnText}>Login  →</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            style={s.signupRow}
            activeOpacity={0.7}
          >
            <Text style={s.signupText}>
              Don't have an account?{'  '}
              <Text style={s.signupLink}>SIGN UP</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#0a0a0a' },
  flex:             { flex: 1 },
  scroll:           { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  logo:             { width: 80, height: 14, marginBottom: 24, opacity: 0.55 },
  heading:          { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  subheading:       { fontSize: 15, color: '#bbbbbb', marginBottom: 36 },
  label:            { fontSize: 13, color: '#cccccc', marginBottom: 8, marginTop: 4 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', paddingHorizontal: 16, height: 56, marginBottom: 16 },
  input:            { flex: 1, color: '#ffffff', fontSize: 15, height: '100%' },
  eyeBtn:           { padding: 4 },
  eyeIcon:          { fontSize: 18, color: '#999999' },
  forgotRow:        { alignSelf: 'flex-end', marginBottom: 28 },
  forgotText:       { fontSize: 13, color: '#F26522' },
  loginBtn:         { width: '100%', height: 56, backgroundColor: '#F26522', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginBtnDisabled: { backgroundColor: '#F9B697' },
  loginBtnText:     { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  signupRow:        { alignItems: 'center', marginTop: 8 },
  signupText:       { fontSize: 14, color: '#bbbbbb' },
  signupLink:       { color: '#F26522', fontWeight: '700' },
});
