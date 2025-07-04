import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import JournalScreen from '../screen/JournalScreen';
import DreamCluesScreen from '../screen/DreamCluesScreen';
import ToolsScreen from '../screen/ToolsScreen';
import SettingsScreen from '../screen/SettingsScreen';
import AddEditDreamScreen from '../screen/AddEditDreamScreen';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Tagebuch"
      activeColor={colors.accent}
      inactiveColor={colors.textSecondary}
      barStyle={{ backgroundColor: colors.surface }}
    >
      <Tab.Screen
        name="Tagebuch"
        component={JournalScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="notebook-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Traum-Spuren"
        component={DreamCluesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="lightbulb-on-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Werkzeuge"
        component={ToolsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="hammer-wrench" color={color} size={26} />
          ),
        }}
      />
       <Tab.Screen
        name="Einstellungen"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddEditDream" component={AddEditDreamScreen} options={{ presentation: 'modal' }}/>
        </Stack.Navigator>
    )
}

export default AppNavigator;