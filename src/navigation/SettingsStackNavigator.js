// navigation/SettingsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
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
      <SettingsStack.Screen name="ChangePassword" component={PlaceholderScreen} />
      <SettingsStack.Screen name="NotificationSettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="PrivacySettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="LanguageSettings" component={PlaceholderScreen} />
      <SettingsStack.Screen name="About" component={PlaceholderScreen} />
    </SettingsStack.Navigator>
  );
}