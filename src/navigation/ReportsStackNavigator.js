// navigation/ReportsStackNavigation.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '../screens/ReportsScreen';
import TotalGoalsScreen from '../screens/reports/TotalGoalsScreen';
import CompletedGoalsScreen from '../screens/reports/CompletedGoalsScreen';
import PendingGoalsScreen from '../screens/reports/PendingGoalsScreen';
import SuccessRateScreen from '../screens/reports/SuccessRateScreen'; // 這裡檔名你原本多打了一個 "ScreenScreen"

const Stack = createNativeStackNavigator();

export default function ReportsStackNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 首頁 */}
      <Stack.Screen name="ReportsMain" component={ReportsScreen} />

      {/* 指標頁面 */}
      <Stack.Screen
        name="TotalGoals"
        component={TotalGoalsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="CompletedGoals"
        component={CompletedGoalsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="PendingGoals"
        component={PendingGoalsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="SuccessRate"
        component={SuccessRateScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
