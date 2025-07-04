import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Card, Title, Switch } from 'react-native-paper';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

import { colors } from '../theme/colors';
import { getDreams } from '../services/database';
import { useSettings } from '../context/SettingsContext';

const availableSounds = [
    { label: 'Standard-Ton', value: undefined, source: undefined },
    { label: 'Glitter', value: 'glitter.mp3', source: require('../../assets/sounds/glitter.mp3') },
    { label: 'Ring', value: 'ring.mp3', source: require('../../assets/sounds/ring.mp3') },
];

const SettingsScreen = () => {
  const { sound: selectedSound, setSound } = useSettings();
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);

  async function playSound(source: any) {
    if (!source) return;
    try {
      if (soundObject) {
        await soundObject.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(source);
      setSoundObject(sound);
      await sound.playAsync();
    } catch (e) {
      console.error("Couldn't play sound", e);
    }
  }

  useEffect(() => {
    return soundObject
      ? () => {
          soundObject.unloadAsync();
        }
      : undefined;
  }, [soundObject]);

  const handleSoundSelection = (soundOption: (typeof availableSounds)[0]) => {
    setSound(soundOption.value);
    playSound(soundOption.source);
  };

  const handleExport = async () => {
    try {
      const dreams = await getDreams();
      if (dreams.length === 0) {
        Alert.alert("Export nicht möglich", "Dein Tagebuch ist leer.");
        return;
      }
      const dreamsJson = JSON.stringify(dreams, null, 2);
      const uri = FileSystem.documentDirectory + 'dream_weaver_export.json';
      await FileSystem.writeAsStringAsync(uri, dreamsJson, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Teilen nicht verfügbar", "Dein Gerät unterstützt diese Funktion nicht.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Fehler", "Der Export konnte nicht abgeschlossen werden.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Einstellungen</Text>
      <ScrollView>
        <Card style={styles.card}>
            <List.Section>
                <List.Subheader style={{ color: colors.textSecondary }}>Benachrichtigungston</List.Subheader>
                {availableSounds.map((s) => (
                    <List.Item
                        key={s.label}
                        title={s.label}
                        titleStyle={{ color: colors.text }}
                        onPress={() => handleSoundSelection(s)}
                        right={props => selectedSound === s.value ? <List.Icon {...props} icon="check" color={colors.accent} /> : null}
                    />
                ))}
            </List.Section>
        </Card>

        <Card style={styles.card}>
          <List.Section>
            <List.Subheader style={{ color: colors.textSecondary }}>Datenverwaltung</List.Subheader>
            <List.Item
              title="Tagebuch exportieren"
              titleStyle={{ color: colors.text }}
              left={props => <List.Icon {...props} icon="export" color={colors.accent} />}
              onPress={handleExport}
            />
          </List.Section>
        </Card>

        {/* Weitere Einstellungs-Karten... */}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: colors.background,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 24,
      },
      card: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: colors.surface,
      },
});

export default SettingsScreen;