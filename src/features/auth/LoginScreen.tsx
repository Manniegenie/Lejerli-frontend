import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading as setGlobalLoading } from '../../store/authSlice';
import authService from '../../services/authService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      dispatch(setGlobalLoading(true));
      setLoading(true);
      const response = await authService.login({ email, password });
      if (response.success) {
        dispatch(setCredentials({
          user: { id: response.data.id, email: response.data.email, username: response.data.username },
          token: response.data.token,
        }));
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      dispatch(setGlobalLoading(false));
      setLoading(false);
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

          <Text style={styles.subtitle}>Log in to your Lejerli account</Text>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleButton}>
            <Image source={require('../../../assets/google.png')} style={styles.googleIcon} resizeMode="contain" />
            <Text style={styles.googleText}>Continue With Google</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Work Email</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput style={styles.input} placeholder="Enter your work Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#555" />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⊕</Text>
            <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#555" />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login  →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?{' '}<Text style={styles.signupLink}>SIGN UP</Text></Text>
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
  subtitle: {
    fontSize: 15,
    color: '#888888',
    marginBottom: 28,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    height: 64,
    gap: 10,
    marginBottom: 20,
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  dividerText: {
    fontSize: 13,
    color: '#555',
  },
  label: {
    fontSize: 13,
    color: '#aaaaaa',
    marginBottom: 6,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 4,
    gap: 10,
  },
  inputIcon: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    height: '100%',
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#555',
    paddingLeft: 8,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: '#F26522',
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
  signupRow: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 13,
    color: '#888',
  },
  signupLink: {
    color: '#F26522',
    fontWeight: '700',
  },
});
