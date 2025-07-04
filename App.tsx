import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';

import { colors } from './src/theme/colors';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/services/database';
import AuthScreen from './src/screen/AuthScreen';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';

const paperTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
  },
};

const navigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: 'transparent',
    notification: colors.accent,
  },
};

export default function App() {
  useEffect(() => {
    initDB().catch(err => {
      console.log('Datenbank-Initialisierung fehlgeschlagen');
      console.log(err);
    });
  }, []);

  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

const AppContent = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { isLockEnabled, isReady } = useSettings();

  const handleAuthentication = async () => {
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entsperre Dream Weaver',
      });
      if (result.success) {
        setIsUnlocked(true);
      }
    }
  };

  useEffect(() => {
    if (isReady) {
      if (isLockEnabled) {
        handleAuthentication();
      } else {
        setIsUnlocked(true);
      }
    }
  }, [isLockEnabled, isReady]);

  if (!isReady || !isUnlocked) {
    return <AuthScreen onAuthenticate={handleAuthentication} />;
  }

  return (
     <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  )
}