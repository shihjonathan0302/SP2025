// App.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { GoalsProvider } from './src/contexts/GoalsContext';
import { PrefsProvider } from './src/contexts/PrefsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

import MainScreen from './src/screens/MainScreen';
import CommunityScreen from './src/screens/CommunityScreen';
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
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ color }) => {
          let icon = 'ellipse';
          if (route.name === 'Main') icon = 'home-outline';
          if (route.name === 'Reports') icon = 'bar-chart-outline';
          if (route.name === 'Community') icon = 'people-outline';
          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Main" component={MainScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ title: 'Community' }} />
    </Tab.Navigator>
  );
}

function RootNavigator({ isSignedIn }) {
  return (
    <Stack.Navigator>
      {isSignedIn ? (
        <>
          <Stack.Screen
            name="RootTabs"
            component={Tabs}
            options={({ navigation, route }) => {
              const focused = getFocusedRouteNameFromRoute(route) ?? 'Main';
              const titleMap = {
                Main: 'Dashboard',
                Reports: 'Reports',
                Community: 'Community',
              };
              const headerTitle = titleMap[focused] ?? 'Dashboard';

              return {
                headerTitle,
                headerTitleAlign: 'center',
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    style={{ paddingHorizontal: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                  >
                    <Ionicons name="settings-outline" size={22} color="#111" />
                  </TouchableOpacity>
                ),
              };
            }}
          />

          <Stack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{ title: 'Goal' }}
          />

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

// AppInner 負責使用 theme
function AppInner({ isSignedIn }) {
  const { theme } = useTheme(); // 從 ThemeContext 取得現在主題

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator isSignedIn={isSignedIn} />
    </NavigationContainer>
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
      <PrefsProvider>
        <ThemeProvider>
          <AppInner isSignedIn={isSignedIn} />
        </ThemeProvider>
      </PrefsProvider>
    </GoalsProvider>
  );
}