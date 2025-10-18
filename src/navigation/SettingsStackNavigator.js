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
import PrivacySharing from '../screens/settings/PrivacySharingScreen';
import DataSecurityScreen from '../screens/settings/DataSecurityScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import LegalScreen from '../screens/settings/LegalScreen';


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

      <SettingsStack.Screen
        name="PrivacySharing"
        component={PrivacySharing}
        options={{ title: 'Privacy & Sharing' }}
      />

      <SettingsStack.Screen
        name="DataSecurity"
        component={require('../screens/settings/DataSecurityScreen').default}
        options={{ title: 'Data & Security' }}
      />

      <SettingsStack.Screen
        name="Support"
        component={require('../screens/settings/SupportScreen').default}
        options={{ title: 'Support' }}
      />

      <SettingsStack.Screen
        name="Legal"
        component={require('../screens/settings/LegalScreen').default}
        options={{ title: 'Legal' }}
      />

    </SettingsStack.Navigator>
  );
}