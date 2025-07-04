import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Card, Title, Switch, Paragraph, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';
import DatePicker from 'react-native-date-picker';
import { colors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REALITY_CHECK_IDENTIFIER_PREFIX = 'reality-check-';
const TOTEM_IDENTIFIER_PREFIX = 'totem-sound-';

const ToolsScreen = () => {
  const { sound } = useSettings();
  const [isRealityCheckEnabled, setIsRealityCheckEnabled] = useState(false);
  const [realityCheckInterval, setRealityCheckInterval] = useState(60);
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(8, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(22, 0, 0)));
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  
  const [totemAmount, setTotemAmount] = useState(3);

  const cancelAllRealityChecks = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(REALITY_CHECK_IDENTIFIER_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  };

  const scheduleRealityChecksForDay = async (interval: number, start: Date, end: Date) => {
    await cancelAllRealityChecks();
    const now = new Date();
    let currentTime = new Date(start);
    if (currentTime < now) {
        currentTime = now;
    }
    while (currentTime <= end) {
      const identifier = `${REALITY_CHECK_IDENTIFIER_PREFIX}${currentTime.getTime()}`;
      const seconds = Math.round((currentTime.getTime() - now.getTime()) / 1000);

      if (seconds > 0) {
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: "Dream Weaver",
            body: 'Realitäts-Check: Träumst du gerade?',
            sound: sound,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: seconds,
          },
        });
      }
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
  };

  const onToggleRealityCheck = async (value: boolean) => {
    setIsRealityCheckEnabled(value);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Benachrichtigungen sind erforderlich, um diese Funktion zu nutzen.');
        setIsRealityCheckEnabled(false);
        return;
      }
      await scheduleRealityChecksForDay(realityCheckInterval, startTime, endTime);
      Alert.alert("Aktiviert", "Realitäts-Checks sind für heute geplant.");
    } else {
      await cancelAllRealityChecks();
      Alert.alert("Deaktiviert", "Alle geplanten Realitäts-Checks wurden entfernt.");
    }
  };
  
  const onSettingsChanged = () => {
    if (isRealityCheckEnabled) {
      scheduleRealityChecksForDay(realityCheckInterval, startTime, endTime);
    }
  };

  const startSleepSession = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Benachrichtigungen sind erforderlich.');
      return;
    }
    await cancelAllTotems(); 
    const firstREMStartTimeInMinutes = 270; 
    const remPhaseDurationInMinutes = 120;
    const calculatedInterval = totemAmount > 1 ? remPhaseDurationInMinutes / (totemAmount - 1) : 0;
    for (let i = 0; i < totemAmount; i++) {
      const delayInMinutes = i * calculatedInterval;
      const triggerTimeInSeconds = (firstREMStartTimeInMinutes + delayInMinutes) * 60;
      await Notifications.scheduleNotificationAsync({
        identifier: `${TOTEM_IDENTIFIER_PREFIX}${i}`,
        content: {
          title: "Totem-Sound",
          body: `Traum-Signal ${i + 1}`,
          sound: sound
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerTimeInSeconds,
        }
      });
    }
    Alert.alert(
      "Gute Nacht!",
      `${totemAmount} Totem-Sounds sind jetzt über deine nächste lange REM-Phase verteilt.`
    );
  };

  const cancelAllTotems = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(TOTEM_IDENTIFIER_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  };

  return (
    <View style={styles.container}>
       <Text style={styles.title}>Werkzeuge für Klarträume</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Realitäts-Checks (Tagsüber)</Title>
          <View style={styles.row}>
            <Paragraph style={styles.paragraph}>Aktivieren</Paragraph>
            <Switch value={isRealityCheckEnabled} onValueChange={onToggleRealityCheck} color={colors.primary}/>
          </View>
          <View style={styles.timePickerRow}>
            <TouchableOpacity onPress={() => setStartTimePickerVisible(true)} disabled={!isRealityCheckEnabled}>
                <View>
                    <Text style={styles.timeLabel}>Startzeit</Text>
                    <Text style={styles.timeText}>{startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEndTimePickerVisible(true)} disabled={!isRealityCheckEnabled}>
                 <View>
                    <Text style={styles.timeLabel}>Endzeit</Text>
                    <Text style={styles.timeText}>{endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
            </TouchableOpacity>
          </View>
          <Paragraph style={styles.paragraph}>
            Intervall: {Math.round(realityCheckInterval)} Minuten
          </Paragraph>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={30}
            maximumValue={180}
            step={15}
            value={realityCheckInterval}
            onValueChange={setRealityCheckInterval}
            onSlidingComplete={onSettingsChanged}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.textSecondary}
            thumbTintColor={colors.accent}
            disabled={!isRealityCheckEnabled}
          />
        </Card.Content>
      </Card>
      <DatePicker
        modal
        open={isStartTimePickerVisible}
        date={startTime}
        mode="time"
        title="Startzeit auswählen"
        confirmText="Bestätigen"
        cancelText="Abbrechen"
        onConfirm={(date) => {
          setStartTimePickerVisible(false);
          setStartTime(date);
          onSettingsChanged();
        }}
        onCancel={() => {
          setStartTimePickerVisible(false);
        }}
      />
       <DatePicker
        modal
        open={isEndTimePickerVisible}
        date={endTime}
        mode="time"
        title="Endzeit auswählen"
        confirmText="Bestätigen"
        cancelText="Abbrechen"
        onConfirm={(date) => {
          setEndTimePickerVisible(false);
          setEndTime(date);
          onSettingsChanged();
        }}
        onCancel={() => {
          setEndTimePickerVisible(false);
        }}
      />
       <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Totem-Sounds (Nachts)</Title>
          <Paragraph style={styles.paragraph}>Anzahl der Töne: {totemAmount}</Paragraph>
           <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={totemAmount}
            onValueChange={setTotemAmount}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.textSecondary}
            thumbTintColor={colors.accent}
          />
          <Paragraph style={styles.disabledText}>
            Die Töne werden automatisch über eine 120-minütige REM-Phase verteilt.
          </Paragraph>
          <Button 
            mode="contained" 
            icon="sleep"
            onPress={startSleepSession}
            style={{marginTop: 16, backgroundColor: colors.primary}}
          >
            Ich gehe jetzt schlafen
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  card: {
    marginVertical: 8,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
  },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  timeText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  disabledText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default ToolsScreen;