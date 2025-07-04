import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundType = string | undefined;

interface SettingsContextType {
  sound: SoundType;
  setSound: (sound: SoundType) => void;
  isLockEnabled: boolean;
  toggleLock: () => void;
  isReady: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [sound, setSoundState] = useState<SoundType>(undefined);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSound = await AsyncStorage.getItem('notification_sound');
      setSoundState(savedSound === 'default' || savedSound === null ? undefined : savedSound);

      const savedLockStatus = await AsyncStorage.getItem('app_lock_enabled');
      setIsLockEnabled(savedLockStatus === 'true');
      
      setIsReady(true);
    };
    loadSettings();
  }, []);

  const setSound = async (newSound: SoundType) => {
    setSoundState(newSound);
    await AsyncStorage.setItem('notification_sound', newSound === undefined ? 'default' : newSound);
  };

  const toggleLock = async () => {
    const newLockStatus = !isLockEnabled;
    setIsLockEnabled(newLockStatus);
    await AsyncStorage.setItem('app_lock_enabled', newLockStatus.toString());
  };

  return (
    <SettingsContext.Provider value={{ sound, setSound, isLockEnabled, toggleLock, isReady }}>
      {isReady ? children : null}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};