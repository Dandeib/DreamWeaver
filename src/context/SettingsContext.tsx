import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundType = string | undefined;

interface SettingsContextType {
  sound: SoundType;
  setSound: (sound: SoundType) => void;
  isLockEnabled: boolean;
  toggleLock: () => void;
  
  isRealityCheckEnabled: boolean;
  setIsRealityCheckEnabled: (value: boolean) => void;
  realityCheckInterval: number;
  setRealityCheckInterval: (value: number) => void;

  totemAmount: number;
  setTotemAmount: (value: number) => void;
  isSleepSessionActive: boolean;
  toggleSleepSession: () => void;

  isReady: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [sound, setSoundState] = useState<SoundType>(undefined);
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isRealityCheckEnabled, setRealityCheckEnabledState] = useState(false);
  const [realityCheckInterval, setRealityCheckIntervalState] = useState(60);
  const [totemAmount, setTotemAmountState] = useState(3);
  const [isSleepSessionActive, setIsSleepSessionActive] = useState(false);
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSound = await AsyncStorage.getItem('notification_sound');
      setSoundState(savedSound === 'default' || savedSound === null ? undefined : savedSound);

      const savedLockStatus = await AsyncStorage.getItem('app_lock_enabled');
      setIsLockEnabled(savedLockStatus === 'true');

      const savedRCEnabled = await AsyncStorage.getItem('rc_enabled');
      setRealityCheckEnabledState(savedRCEnabled === 'true');

      const savedRCInterval = await AsyncStorage.getItem('rc_interval');
      setRealityCheckIntervalState(savedRCInterval ? parseInt(savedRCInterval, 10) : 60);

      const savedTotemAmount = await AsyncStorage.getItem('totem_amount');
      setTotemAmountState(savedTotemAmount ? parseInt(savedTotemAmount, 10) : 3);
      
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

  const setIsRealityCheckEnabled = async (value: boolean) => {
    setRealityCheckEnabledState(value);
    await AsyncStorage.setItem('rc_enabled', value.toString());
  };

  const setRealityCheckInterval = async (value: number) => {
    setRealityCheckIntervalState(value);
    await AsyncStorage.setItem('rc_interval', value.toString());
  };

  const setTotemAmount = async (value: number) => {
    setTotemAmountState(value);
    await AsyncStorage.setItem('totem_amount', value.toString());
  };

  const toggleSleepSession = () => {
    setIsSleepSessionActive(prev => !prev);
  }

  return (
    <SettingsContext.Provider value={{ 
      sound, setSound, 
      isLockEnabled, toggleLock, 
      isRealityCheckEnabled, setIsRealityCheckEnabled,
      realityCheckInterval, setRealityCheckInterval,
      totemAmount, setTotemAmount,
      isSleepSessionActive, toggleSleepSession,
      isReady 
    }}>
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