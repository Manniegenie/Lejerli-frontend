import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout, setCredentials, setLoading } from '../store/authSlice';
import authService from '../services/authService';

// Auth Screens
import LoginScreen from '../features/auth/LoginScreen';
import SignupScreen from '../features/auth/SignupScreen';
import VerificationScreen from '../features/auth/VerificationScreen';

// Main Screens
import DashboardScreen from '../features/dashboard/DashboardScreen';
import ChannelsScreen from '../features/channels/ChannelsScreen';
import ConnectWalletScreen from '../features/wallet/ConnectWalletScreen';
import TreeExpansionScreen from '../features/trees/TreeExpansionScreen';
import FiatTreeScreen from '../features/trees/FiatTreeScreen';
import CryptoTreeScreen from '../features/trees/CryptoTreeScreen';

// Common
import LoadingScreen from '../components/common/LoadingScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Channels" component={ChannelsScreen} />
      <Stack.Screen name="ConnectWallet" component={ConnectWalletScreen} />
      <Stack.Screen name="TreeExpansion" component={TreeExpansionScreen} />
      <Stack.Screen name="FiatTree" component={FiatTreeScreen} />
      <Stack.Screen name="CryptoTree" component={CryptoTreeScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await authService.getStoredToken();
        const user = await authService.getStoredUser();
        if (token && user) {
          dispatch(setCredentials({ token, user }));
        } else {
          dispatch(setLoading(false));
        }
      } catch (_) {
        dispatch(setLoading(false));
      }
    };
    restoreSession();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
