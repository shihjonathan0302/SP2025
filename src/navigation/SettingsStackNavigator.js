// navigation/SettingsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import PlaceholderScreen from '../screens/settings/PlaceholderScreen';

const SettingsStack = createNativeStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true, // ✅ 啟用 iOS 向右滑返回
      }}
    >
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen name="EditProfile" component={PlaceholderScreen} />
      <SettingsStack.Screen name="ChangePassword" component={PlaceholderScreen} />
      <SettingsStack.Screen name="NotificationSettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="PrivacySettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="LanguageSettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="About" component={PlaceholderScreen} />
    </SettingsStack.Navigator>
  );
}
