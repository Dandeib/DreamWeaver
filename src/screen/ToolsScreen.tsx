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
  const { 
    sound,
    isRealityCheckEnabled, setIsRealityCheckEnabled,
    realityCheckInterval, setRealityCheckInterval,
    totemAmount, setTotemAmount,
    isSleepSessionActive, toggleSleepSession
  } = useSettings();
  
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(8, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(22, 0, 0)));
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [totemStartTime, setTotemStartTime] = useState<Date | null>(null);

  const cancelAllRealityChecks = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith(REALITY_CHECK_IDENTIFIER_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  };

  const scheduleRealityChecksForDay = async () => {
    await cancelAllRealityChecks();
    const now = new Date();
    let currentTime = new Date(startTime);
    if (currentTime < now) {
        currentTime = now;
    }
    while (currentTime <= endTime) {
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
      currentTime.setMinutes(currentTime.getMinutes() + realityCheckInterval);
    }
  };

  const onToggleRealityCheck = async (value: boolean) => {
    setIsRealityCheckEnabled(value);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Benachrichtigungen sind erforderlich.');
        setIsRealityCheckEnabled(false);
        return;
      }
      await scheduleRealityChecksForDay();
      Alert.alert("Aktiviert", "Realitäts-Checks sind für heute geplant.");
    } else {
      await cancelAllRealityChecks();
      Alert.alert("Deaktiviert", "Alle geplanten Realitäts-Checks wurden entfernt.");
    }
  };
  
  const onSettingsChanged = () => {
    if (isRealityCheckEnabled) {
      scheduleRealityChecksForDay();
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
    const remPhaseDurationInMinutes = 110;
    const calculatedInterval = totemAmount > 1 ? remPhaseDurationInMinutes / (totemAmount - 1) : 0;
    
    const firstSoundTime = new Date(Date.now() + firstREMStartTimeInMinutes * 60 * 1000);
    setTotemStartTime(firstSoundTime);

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
    toggleSleepSession();
    Alert.alert(
      "Gute Nacht!",
      `${totemAmount} Totem-Sounds sind jetzt über deine nächste lange REM-Phase verteilt.`
    );
  };

  const stopSleepSession = async () => {
    await cancelAllTotems();
    toggleSleepSession();
    setTotemStartTime(null);
    Alert.alert("Sitzung gestoppt", "Alle geplanten Totem-Sounds für diese Nacht wurden entfernt.");
  }

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
        onConfirm={(date) => { setStartTimePickerVisible(false); setStartTime(date); onSettingsChanged(); }}
        onCancel={() => setStartTimePickerVisible(false)}
      />
       <DatePicker
        modal
        open={isEndTimePickerVisible}
        date={endTime}
        mode="time"
        onConfirm={(date) => { setEndTimePickerVisible(false); setEndTime(date); onSettingsChanged(); }}
        onCancel={() => setEndTimePickerVisible(false)}
      />
       <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Totem-Sounds (Nachts)</Title>
          { isSleepSessionActive && totemStartTime && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>Sitzung aktiv.</Text>
              <Text style={styles.feedbackText}>Erster Ton um ca. {totemStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} Uhr.</Text>
            </View>
          )}
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
            disabled={isSleepSessionActive}
          />
          { isSleepSessionActive ? (
            <Button 
              mode="contained" 
              icon="cancel"
              onPress={stopSleepSession}
              style={{marginTop: 16, backgroundColor: colors.error}}
            >
              Schlaf-Sitzung stoppen
            </Button>
          ) : (
            <Button 
              mode="contained" 
              icon="sleep"
              onPress={startSleepSession}
              style={{marginTop: 16, backgroundColor: colors.primary}}
            >
              Ich gehe jetzt schlafen
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background, },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 24, marginTop: 40, },
  card: { marginVertical: 8, backgroundColor: colors.surface, },
  cardTitle: { color: colors.text, marginBottom: 16, },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, },
  timePickerRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 16, },
  timeLabel: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', },
  timeText: { color: colors.text, fontSize: 20, fontWeight: 'bold', textAlign: 'center', },
  paragraph: { color: colors.textSecondary, fontSize: 16, },
  feedbackBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  feedbackText: {
    color: colors.accent,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ToolsScreen;