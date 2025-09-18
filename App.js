// App.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarShowLabel: false, // ← 只顯示 icon
        tabBarIcon: ({ color, size }) => {
          let icon = 'ellipse';
          if (route.name === 'Main') icon = 'home-outline';
          if (route.name === 'Reports') icon = 'bar-chart-outline';
          if (route.name === 'Social') icon = 'people-outline';
          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ title: 'Social', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator({ isSignedIn }) {
  return (
    <Stack.Navigator>
      {isSignedIn ? (
        <>
          {/* 顯示 header，左上角放 settings icon */}
          <Stack.Screen
            name="RootTabs"
            component={Tabs}
            options={({ navigation }) => ({
            headerTitle: '', // ⛔️ 拔掉 Futra
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={{ paddingHorizontal: 12 }}
                >
                  <Ionicons name="settings-outline" size={22} color="#111" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{ title: 'Goal' }}
          />
          {/* 專用的 Settings Stack（由左上角 icon 進入） */}
          <Stack.Screen
            name="Settings"
            component={SettingsStackNavigator}
            options={{ headerShown: false }}
          />
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
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      console.log('[URL on load]', window.location.href);
    }

    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[getSession]', { hasSession: !!data?.session, error: error?.message });
      setIsSignedIn(!!data?.session);
      setChecking(false);
    });

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