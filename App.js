// App.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Platform,
  TouchableOpacity,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { GoalsProvider } from './src/contexts/GoalsContext';
import { PrefsProvider } from './src/contexts/PrefsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

import MainScreen from './src/screens/main/MainScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import GoalDetailScreen from './src/screens/main/GoalDetailScreen';
import CreateGoalFlow from './src/screens/createGoal/CreateGoalFlow';
import SettingsStackNavigator from './src/navigation/SettingsStackNavigator';
import ReportsStackNavigator from './src/navigation/ReportsStackNavigator';
import LoginScreen from './src/screens/LoginScreen';

import { supabase } from './src/lib/supabaseClient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

/* ---------------- Notifications ---------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* ---------------- Navigators ---------------- */
const Tab = createBottomTabNavigator();
const RootJSStack = createStackNavigator();

/* ---------------- Tabs ---------------- */
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
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

/* ---------------- Modal 包裝：穩定自適應高度 + 點背景關閉 ---------------- */
function ModalCardWrapper({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 背景遮罩：點擊關閉 */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* 浮動卡片：置中，寬度自適應，最大高度 85%，內容可捲動 */}
      <View
        style={{
          width: '92%',
          maxWidth: 650,
          borderRadius: 24,
          backgroundColor: '#fff',
          overflow: 'hidden',
          paddingVertical: 20,
          paddingHorizontal: 16,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          maxHeight: '85%',
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <CreateGoalFlow />
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------------- Root Stack ---------------- */
function RootNavigator({ isSignedIn }) {
  return (
    <RootJSStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      {isSignedIn ? (
        <>
          <RootJSStack.Screen
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
                headerStyle: {
                  height: 145,
                  backgroundColor: '#F9FAFB',
                  shadowColor: '#000',
                  elevation: 4,
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: '700',
                },
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    style={{
                      marginLeft: 15,
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFF',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="settings-outline" size={26} color="#111827" />
                  </TouchableOpacity>
                ),
                headerRight: () =>
                  focused === 'Main' ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('CreateGoalFlow')}
                      accessibilityRole="button"
                      accessibilityLabel="Add goal"
                      style={{
                        marginRight: 15,
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={26} color="#2563EB" />
                    </TouchableOpacity>
                  ) : null,
              };
            }}
          />

          {/* 使用穩定版浮動 Modal */}
          <RootJSStack.Screen
            name="CreateGoalFlow"
            component={ModalCardWrapper}
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              cardStyle: { backgroundColor: 'transparent' },
              gestureEnabled: true,
              gestureDirection: 'vertical',
              cardStyleInterpolator:
                Platform.OS === 'ios'
                  ? CardStyleInterpolators.forModalPresentationIOS
                  : CardStyleInterpolators.forFadeFromBottomAndroid,
            }}
          />

          <RootJSStack.Screen
            name="GoalDetail"
            component={GoalDetailScreen}
            options={{
              headerTitle: 'Goal Details',
              headerTitleAlign: 'center',
              gestureDirection: 'horizontal',
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />

          <RootJSStack.Screen
            name="Settings"
            component={SettingsStackNavigator}
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          />
        </>
      ) : (
        <RootJSStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </RootJSStack.Navigator>
  );
}

/* ---------------- Theme Wrapper ---------------- */
function AppInner({ isSignedIn }) {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator isSignedIn={isSignedIn} />
    </NavigationContainer>
  );
}

/* ---------------- Main App ---------------- */
export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[getSession]', { hasSession: !!data?.session, error: error?.message });
      setIsSignedIn(!!data?.session);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange]', event, { hasSession: !!session });
      setIsSignedIn(!!session);
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (Platform.OS === 'web') return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Permission for notifications was denied.');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    registerForPushNotificationsAsync();
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