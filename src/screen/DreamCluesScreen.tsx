import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDreams, Dream } from '../services/database';
import { colors } from '../theme/colors';
import { Chip } from 'react-native-paper';

const germanStopWords = ["ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "sich", "der", "die", "das", "ein", "eine", "eines", "einer", "einem", "einen", "und", "oder", "aber", "als", "an", "auf", "aus", "bei", "bis", "da", "dann", "dass", "dich", "dir", "doch", "durch", "für", "habe", "hat", "hatte", "hatten", "hier", "hin", "hinter", "ich", "ihm", "ihn", "ihnen", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "im", "in", "ist", "ja", "jede", "jedem", "jeden", "jeder", "jedes", "jetzt", "kann", "kannst", "können", "könnt", "mache", "machen", "machst", "macht", "man", "mein", "meine", "meinem", "meinen", "meiner", "meines", "mich", "mir", "mit", "muss", "müssen", "musst", "nach", "nicht", "nichts", "noch", "nun", "nur", "ob", "schon", "sein", "seine", "seinem", "seinen", "seiner", "seines", "selbst", "sich", "sind", "so", "sondern", "um", "und", "uns", "unser", "unsere", "unserem", "unseren", "unserer", "unseres", "unter", "vom", "von", "vor", "wann", "war", "waren", "warst", "was", "weg", "weil", "weiter", "weitere", "weiteren", "weiteres", "wenn", "werde", "werden", "werdest", "werdet", "wie", "wieder", "will", "willst", "wir", "wird", "wirst", "wissen", "wo", "wollte", "wollten", "während", "würde", "würden", "würdest", "würdet", "zu", "zum", "zur", "zwar", "zwischen", "über", "warum", "diese", "dieser", "dieses", "bin"];

const DreamCluesScreen = () => {
  const [dreamClues, setDreamClues] = useState<{ text: string; count: number }[]>([]);

  useFocusEffect(
    useCallback(() => {
      const analyzeDreams = async () => {
        const dreams = await getDreams();
        if (dreams.length === 0) {
          setDreamClues([]);
          return;
        }

        const allWords = dreams
          .map(dream => dream.content)
          .join(' ')
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/);

        const wordCounts: { [key: string]: number } = {};

        for (const word of allWords) {
          if (word && !germanStopWords.includes(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        }
        
        const sortedClues = Object.entries(wordCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 15)
          .map(([text, count]) => ({ text, count }));

        setDreamClues(sortedClues);
      };

      analyzeDreams();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Häufigste Traum-Spuren</Text>
      {dreamClues.length > 0 ? (
        <View style={styles.chipContainer}>
          {dreamClues.map((clue) => (
            <Chip key={clue.text} style={styles.chip} textStyle={styles.chipText} mode="outlined">
              {clue.text} ({clue.count})
            </Chip>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Schreibe mehr Träume auf, um deine persönlichen Traum-Spuren zu entdecken.
        </Text>
      )}
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    margin: 4,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
});

export default DreamCluesScreen;