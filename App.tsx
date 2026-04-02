import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { useFonts } from 'expo-font';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { setCredentials } from './src/store/authSlice';
import authService from './src/services/authService';

function AppContent() {
  const dispatch = useDispatch();
  const [fontsLoaded] = useFonts({
    'GeneralSans': require('./assets/fonts/GeneralSans-Variable.ttf'),
    'GeneralSans-Italic': require('./assets/fonts/GeneralSans-VariableItalic.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        * { font-family: 'GeneralSans', -apple-system, sans-serif; }
        *:focus, *:focus-visible, *:focus-within {
          outline: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
        input, textarea {
          outline: none !important;
          -webkit-appearance: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
      <StatusBar style="light" />
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
