import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setCredentials } from './src/store/authSlice';
import authService from './src/services/authService';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for stored auth on app load
    const loadStoredAuth = async () => {
      const token = await authService.getStoredToken();
      const user = await authService.getStoredUser();

      if (token && user) {
        dispatch(setCredentials({ user, token }));
      }
    };

    loadStoredAuth();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
