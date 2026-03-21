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
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
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
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleSignup = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.signup({ email, username, password });
      if (response.success) {
        dispatch(
          setCredentials({
            user: {
              id: response.data.id,
              email: response.data.email,
              username: response.data.username,
            },
            token: response.data.token,
          })
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.response?.data?.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const buttonActive = agreedToTerms && !loading;

  return (
    <View style={styles.container}>
      {/* Left panel — background image (visible on wide screens) */}
      {isWide && (
        <View style={styles.leftPanel}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.bgImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Right panel — form */}
      <ScrollView
        style={[styles.rightPanel, !isWide && styles.rightPanelFull]}
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join thousands of users on SkillMart</Text>

        {/* Google Button */}
        <TouchableOpacity style={styles.googleButton}>
          <View style={styles.googleLogoBox}>
            <Text style={[styles.googleLetter, { color: '#4285F4' }]}>G</Text>
            <Text style={[styles.googleLetter, { color: '#EA4335' }]}>o</Text>
            <Text style={[styles.googleLetter, { color: '#FBBC05' }]}>o</Text>
            <Text style={[styles.googleLetter, { color: '#4285F4' }]}>g</Text>
            <Text style={[styles.googleLetter, { color: '#34A853' }]}>l</Text>
            <Text style={[styles.googleLetter, { color: '#EA4335' }]}>e</Text>
          </View>
          <Text style={styles.googleText}>Continue With Google</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Work Email */}
        <Text style={styles.label}>Work Email</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your work Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#555"
          />
        </View>

        {/* Company Name */}
        <Text style={styles.label}>Company Name</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>⊙</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Company Name"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#555"
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>⊕</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#555"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '◉' : '◎'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Must be at least 8 characters</Text>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>⊕</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#555"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.eyeIcon}>{showConfirmPassword ? '◉' : '◎'}</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.7}
        >
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

        {/* Create Account Button */}
        <TouchableOpacity
          style={[styles.button, !buttonActive && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={!buttonActive}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create account  →</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginRow}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>LOGIN</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
  },

  // Left panel
  leftPanel: {
    flex: 1,
    backgroundColor: '#111',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },

  // Right panel
  rightPanel: {
    width: 775,
    backgroundColor: '#0a0a0a',
  },
  rightPanelFull: {
    width: undefined,
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 48,
    paddingVertical: 40,
    gap: 0,
  },

  logo: {
    width: 48,
    height: 48,
    marginBottom: 24,
  },

  title: {
    fontSize: 44,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 44,
    fontFamily: 'GeneralSans-Medium',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    marginBottom: 28,
  },

  // Google button
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
  },
  googleLogoBox: {
    flexDirection: 'row',
  },
  googleLetter: {
    fontSize: 15,
    fontWeight: '700',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },

  // OR divider
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

  // Inputs
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
    paddingHorizontal: 16,
    height: 56,
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

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
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

  // Create account button
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

  // Login link
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
