import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import authService from '../../services/authService';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const titleTranslateY = useRef(new Animated.Value(-40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

    try {
      setLoading(true);
      const response = await authService.signup({ email, username, password });
      if (response.success) {
        navigation.navigate('Verification', { email });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const buttonActive = agreedToTerms && !loading;

  return (
    <View style={styles.container}>
      {/* Left panel */}
      <View style={styles.leftPanel}>
        <Image source={require('../../../assets/nomads.jpg')} style={styles.bgImage} resizeMode="cover" />
      </View>

      {/* Black space — centers the form within remaining area */}
      <View style={styles.blackSpace}>
      <View style={styles.rightPanel}>
        <View style={styles.content}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

          {/* Progress bars */}
          <View style={styles.progressRow}>
            <View style={styles.progressOrange} />
            <View style={styles.progressGray} />
          </View>

          <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
            Create your account
          </Animated.Text>

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

          <Text style={styles.label}>Company Name</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⊙</Text>
            <TextInput style={styles.input} placeholder="Enter your Company Name" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor="#555" />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⊕</Text>
            <TextInput style={styles.input} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#555" />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Min 7 characters, include a digit and special character (e.g. !@#$%)</Text>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>⊕</Text>
            <TextInput style={styles.input} placeholder="Enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} placeholderTextColor="#555" />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.eyeIcon}>{showConfirmPassword ? '◉' : '◎'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)} activeOpacity={0.7}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to Lejerli's{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.button, !buttonActive && styles.buttonDisabled]} onPress={handleSignup} disabled={!buttonActive}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account  →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?{' '}<Text style={styles.loginLink}>LOGIN</Text>
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  progressOrange: {
    flex: 390,
    height: 6,
    borderRadius: 100,
    backgroundColor: '#F26522',
  },
  progressGray: {
    flex: 389,
    height: 6,
    borderRadius: 100,
    backgroundColor: '#F9F9FA',
  },
  title: {
    fontSize: 44,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 44,
    fontFamily: 'GeneralSans',
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    height: 52,
    gap: 10,
    marginBottom: 20,
    marginTop: 16,
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
  hint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    marginTop: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#F26522',
    borderColor: '#F26522',
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
  },
  termsLink: {
    color: '#F26522',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    marginBottom: 12,
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
  loginRow: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#888',
  },
  loginLink: {
    color: '#F26522',
    fontWeight: '700',
  },
});
