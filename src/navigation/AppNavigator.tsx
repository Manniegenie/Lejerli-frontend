import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { TouchableOpacity, Text } from 'react-native';
import { logout } from '../store/authSlice';
import authService from '../services/authService';

// Auth Screens
import LoginScreen from '../features/auth/LoginScreen';
import SignupScreen from '../features/auth/SignupScreen';
import VerificationScreen from '../features/auth/VerificationScreen';
import TwoFactorScreen from '../features/auth/TwoFactorScreen';

// Main Screens
import DashboardScreen from '../features/dashboard/DashboardScreen';
import ChannelsScreen from '../features/channels/ChannelsScreen';
import HomeScreen from '../features/home/HomeScreen';
import ConnectWalletScreen from '../features/wallet/ConnectWalletScreen';

// Common
import LoadingScreen from '../components/common/LoadingScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Channels" component={ChannelsScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ConnectWallet"
        component={ConnectWalletScreen}
        options={({ navigation }) => ({
          title: 'Connect Wallet',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
