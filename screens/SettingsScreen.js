// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GoalsProvider } from './contexts/GoalsContext';

import MainScreen from './screens/MainScreen';
import ReportsScreen from './screens/ReportsScreen';
import SocialScreen from './screens/SocialScreen';
import GoalDetailScreen from './screens/GoalDetailScreen';
import SettingsStackNavigator from './navigation/SettingsStackNavigator';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Main" component={MainScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RootTabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GoalsProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GoalsProvider>
  );
}
