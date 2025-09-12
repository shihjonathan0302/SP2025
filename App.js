// App.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GoalsProvider } from './src/contexts/GoalsContext';

import MainScreen from './src/screens/MainScreen';
import SocialScreen from './src/screens/SocialScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';
import SettingsStackNavigator from './src/navigation/SettingsStackNavigator';
import ReportsStackNavigator from './src/navigation/ReportsStackNavigator';

import { supabase } from './src/lib/supabaseClient';
import LoginScreen from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Main" component={MainScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator({ isSignedIn }) {
  return (
    <Stack.Navigator>
      {isSignedIn ? (
        <>
          <Stack.Screen name="RootTabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // ✅ Web：只有真的帶回 OAuth 參數（code / access_token）才交換
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('[URL on load]', window.location.href);
    }
    // 啟動時讀取現有 session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[getSession]', { hasSession: !!data?.session, error: error?.message });
      setIsSignedIn(!!data?.session);
      setChecking(false);
    });

    // 監聽登入/登出事件
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange]', event, { hasSession: !!session });
      setIsSignedIn(!!session);
    });

    return () => {
      try {
        sub?.subscription?.unsubscribe?.();
      } catch (e) {
        console.log('[unsubscribe error]', e);
      }
    };
  }, []);

  if (checking) return null;

  return (
    <GoalsProvider>
      <NavigationContainer>
        <RootNavigator isSignedIn={isSignedIn} />
      </NavigationContainer>
    </GoalsProvider>
  );
}