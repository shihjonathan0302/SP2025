 // src/navigation/SettingsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 第一層首頁（分類）
import SettingsHome from '../screens/settings/SettingsHome';
// Accounts 第二層
import AccountsHome from '../screens/settings/AccountsHome';

// 既有細頁
import EditProfileScreen from '../screens/settings/EditProfileScreen.js';
import LinkedAccountsScreen from '../screens/settings/LinkedAccountsScreen';
import PasswordSecurityScreen from '../screens/settings/PasswordSecurityScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';

// 其他分類（先用你原本的 Placeholder）
import PlaceholderScreen from '../screens/settings/PlaceholderScreen';

import PreferencesHome from '../screens/settings/PreferencesHome';
import PreferencesThemeScreen from '../screens/settings/PreferencesThemeScreen';

import NotificationsHome from '../screens/settings/NotificationsHome';


const SettingsStack = createNativeStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true,
        animationTypeForReplace: 'pop',
        animation: 'slide_from_right',  
        presentation: 'card',
      }}
    >
      {/* 第一層：只放分類 */}
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsHome}
        options={{ title: 'Settings' }}
      />

      {/* 第二層：Accounts */}
      <SettingsStack.Screen
        name="AccountsHome"
        component={AccountsHome}
        options={{ title: 'Account' }}
      />

      {/* Accounts 細頁 */}
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <SettingsStack.Screen name="LinkedAccounts" component={LinkedAccountsScreen} options={{ title: 'Linked Accounts' }} />
      <SettingsStack.Screen name="PasswordSecurity" component={PasswordSecurityScreen} options={{ title: 'Password & Security' }} />
      <SettingsStack.Screen name="Subscriptions" component={SubscriptionScreen} options={{ title: 'Subscriptions' }} />
      <SettingsStack.Screen name="DeleteAccount" component={PlaceholderScreen} options={{ title: 'Delete Account' }} />

      {/* 其他分類（之後換成真正頁面） */}
      <SettingsStack.Screen name="PrivacySharing" component={PlaceholderScreen} />
      <SettingsStack.Screen name="DataSecurity" component={PlaceholderScreen} />
      <SettingsStack.Screen name="Support" component={PlaceholderScreen} />

      <SettingsStack.Screen
        name="PreferencesHome"
        component={PreferencesHome}
        options={{ title: 'Preferences' }}
      />
      <SettingsStack.Screen
        name="PreferencesTheme"
        component={PreferencesThemeScreen}
        options={{ title: 'Theme' }}
      />

      <SettingsStack.Screen
        name="NotificationsHome"
        component={NotificationsHome}
        options={{ title: 'Notifications' }}
      />

    </SettingsStack.Navigator>
  );
}