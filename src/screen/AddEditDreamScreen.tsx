import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Appbar } from 'react-native-paper';
import { colors } from '../theme/colors';
import { addDream, getDreamById, updateDream, deleteDream } from '../services/database';

const AddEditDreamScreen = ({ route, navigation }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  const dreamId = route.params?.dreamId;

  useEffect(() => {
    if (dreamId) {
      setIsEditMode(true);
      const loadDream = async () => {
        const dream = await getDreamById(dreamId);
        if (dream) {
          setTitle(dream.title);
          setContent(dream.content);
        }
      };
      loadDream();
    }
  }, [dreamId]);

  const onSaveDream = async () => {
    if (title.trim().length === 0 || content.trim().length === 0) {
      return;
    }

    if (isEditMode) {
      await updateDream(dreamId, title, content);
    } else {
      await addDream(title, content);
    }

    navigation.goBack();
  };

  const onDeleteDream = async () => {
    if (!isEditMode) return;

    await deleteDream(dreamId);
    navigation.goBack();
  }

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Traum löschen",
      "Möchtest du diesen Traum wirklich endgültig löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", style: "destructive", onPress: onDeleteDream }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditMode ? "Traum bearbeiten" : "Neuer Traum"} />
        {isEditMode && <Appbar.Action icon="delete-outline" onPress={showDeleteConfirmation} />}
      </Appbar.Header>
      <View style={styles.contentContainer}>
        <TextInput
          label="Titel"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Beschreibe deinen Traum..."
          value={content}
          onChangeText={setContent}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={10}
        />
        <Button
          mode="contained"
          onPress={onSaveDream}
          style={styles.button}
          labelStyle={{ color: colors.background }}
          buttonColor={colors.accent}
        >
          Speichern
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default AddEditDreamScreen;