import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from './hooks/useLogin';

export default function LoginScreen({ navigation }: any) {
  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, error, login,
  } = useLogin();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../../assets/logo.png')} style={s.logo} resizeMode="contain" />

          <Text style={s.heading}>Welcome back</Text>
          <Text style={s.subheading}>Sign in to your Lejerli account</Text>

          <TouchableOpacity style={s.googleBtn} activeOpacity={0.7}>
            <Image source={require('../../../assets/google.png')} style={s.googleIcon} resizeMode="contain" />
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.dividerLine} />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

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
            onPress={() => navigation.navigate('Signup')}
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
  safe:            { flex: 1, backgroundColor: '#0a0a0a' },
  flex:            { flex: 1 },
  scroll:          { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  logo:            { width: 120, height: 22, marginBottom: 48 },
  heading:         { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  subheading:      { fontSize: 15, color: '#888888', marginBottom: 36 },
  googleBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 12, height: 56, gap: 10, marginBottom: 24 },
  googleIcon:      { width: 20, height: 20 },
  googleText:      { fontSize: 15, fontWeight: '500', color: '#ffffff' },
  dividerRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  dividerLine:     { flex: 1, height: 1, backgroundColor: '#2a2a2a' },
  dividerText:     { fontSize: 13, color: '#555555' },
  errorBox:        { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:       { fontSize: 13, color: '#ef4444' },
  label:           { fontSize: 13, color: '#aaaaaa', marginBottom: 8, marginTop: 4 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a', paddingHorizontal: 16, height: 56, marginBottom: 16 },
  input:           { flex: 1, color: '#ffffff', fontSize: 15, height: '100%' },
  eyeBtn:          { padding: 4 },
  eyeIcon:         { fontSize: 18, color: '#555555' },
  forgotRow:       { alignSelf: 'flex-end', marginBottom: 28 },
  forgotText:      { fontSize: 13, color: '#F26522' },
  loginBtn:        { width: '100%', height: 56, backgroundColor: '#F26522', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginBtnDisabled:{ backgroundColor: '#F9B697' },
  loginBtnText:    { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  signupRow:       { alignItems: 'center', marginTop: 8 },
  signupText:      { fontSize: 14, color: '#888888' },
  signupLink:      { color: '#F26522', fontWeight: '700' },
});
