import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

interface AuthScreenProps {
  onAuthenticate: () => void;
}

const AuthScreen = ({ onAuthenticate }: AuthScreenProps) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="lock-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.title}>Dream Weaver ist gesperrt</Text>
      <Button
        mode="contained"
        onPress={onAuthenticate}
        icon="fingerprint"
        buttonColor={colors.accent}
        labelStyle={{color: colors.background}}
      >
        Entsperren
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    marginVertical: 24,
  },
});

export default AuthScreen;