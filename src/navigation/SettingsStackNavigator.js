// navigation/SettingsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import LinkedAccountsScreen from '../screens/settings/LinkedAccountsScreen';
import PlaceholderScreen from '../screens/settings/PlaceholderScreen';

const SettingsStack = createNativeStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true,
      }}
    >
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <SettingsStack.Screen
        name="LinkedAccounts"
        component={LinkedAccountsScreen}
        options={{ title: 'Linked Accounts' }}
      />
      <SettingsStack.Screen
        name="ChangePassword"
        component={PlaceholderScreen}
        options={{ title: 'Password & Security' }}
      />
      <SettingsStack.Screen
        name="NotificationSettings"
        component={PlaceholderScreen}
        options={{ title: 'Notifications' }}
      />
      <SettingsStack.Screen
        name="PrivacySettings"
        component={PlaceholderScreen}
        options={{ title: 'Privacy & Sharing' }}
      />
      <SettingsStack.Screen
        name="LanguageSettings"
        component={PlaceholderScreen}
        options={{ title: 'Language' }}
      />
      <SettingsStack.Screen
        name="About"
        component={PlaceholderScreen}
        options={{ title: 'About' }}
      />
    </SettingsStack.Navigator>
  );
}