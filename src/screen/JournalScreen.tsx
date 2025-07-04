import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, Paragraph } from 'react-native-paper';
import { getDreams, Dream } from '../services/database';
import { colors } from '../theme/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const JournalScreen = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const loadDreams = async () => {
        const loadedDreams = await getDreams();
        setDreams(loadedDreams);
      };
      loadDreams();
    }, [])
  );

  const renderDream = ({ item }: { item: Dream }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('AddEditDream', { dreamId: item.id })}
    >
      <Card.Content>
        <Title style={{ color: colors.text }}>{item.title}</Title>
        <Paragraph style={{ color: colors.textSecondary }}>
          {new Date(item.date).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDream}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Noch keine Träume gespeichert.</Text>
            <Text style={styles.emptySubText}>Tippe auf das + um zu beginnen.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddEditDream')}
        color={colors.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
  },
  emptyContainer: {
    flex: 1,
    marginTop: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  }
});

export default JournalScreen;