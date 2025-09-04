// navigation/ReportsStackNavigation.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '../screens/ReportsScreen';
import TotalGoalsScreen from '../screens/reports/TotalGoalsScreen';

const Stack = createNativeStackNavigator();

export default function ReportsStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsMain" component={ReportsScreen} />
      <Stack.Screen
        name="TotalGoals"
        component={TotalGoalsScreen}
        options={{ presentation: 'modal' }} // iOS 模態感；Android 也能用
      />
    </Stack.Navigator>
  );
}
