// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from './screens/MainScreen';
import ReportsScreen from './screens/ReportsScreen';
import SocialScreen from './screens/SocialScreen';
import SettingsScreen from './screens/SettingsScreen';
import GoalDetailScreen from './screens/GoalDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Main" component={MainScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="RootTabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}