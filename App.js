// App.js
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Platform,
  TouchableOpacity,
  View,
  Pressable,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
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

/* ------------------------------------------------
 * Custom Bottom TabBar (liquid glass pill style)
 * ----------------------------------------------*/
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          let icon = 'ellipse';
          if (route.name === 'Main') icon = 'home-outline';
          if (route.name === 'Reports') icon = 'bar-chart-outline';
          if (route.name === 'Community') icon = 'people-outline';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={tabStyles.tabButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name={icon}
                size={22}
                color={isFocused ? '#2563EB' : '#E5E7EB'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------- Tabs ---------------- */
function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          elevation: 0,
          borderTopWidth: 0,
          height: 80,
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Main" component={MainScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
    </Tab.Navigator>
  );
}

/* ------------------------------------------------
 * Create Goal Modal Wrapper
 * ----------------------------------------------*/
function ModalCardWrapper({ navigation }) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleBackgroundPress = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Pressable onPress={handleBackgroundPress} style={{ position: 'absolute', inset: 0 }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{
            width: '84%',
            maxWidth: 640,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            maxHeight: '86%',
            overflow: 'hidden',
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CreateGoalFlow />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

/* ------------------------------------------------
 * Custom Header (Dashboard 文字靠左 + 下拉 + 右側 icons)
 * ----------------------------------------------*/
function AppHeader({ navigation, currentTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const titleMap = {
    Main: 'Dashboard',
    Reports: 'Reports',
    Community: 'Community',
  };
  const title = titleMap[currentTab] ?? 'Dashboard';

  const handleGoTab = (screenName) => {
    setMenuOpen(false);
    navigation.navigate('RootTabs', { screen: screenName });
  };

  const handleGoSettings = () => {
    setMenuOpen(false);
    navigation.navigate('Settings');
  };

  return (
    <View style={headerStyles.container}>
      {/* 下層白底，模擬卡片感覺 */}
      <View style={headerStyles.inner}>
        {/* 左側：標題 + 下拉箭頭 */}
        <TouchableOpacity
          style={headerStyles.titleRow}
          activeOpacity={0.8}
          onPress={() => setMenuOpen((v) => !v)}
        >
          <Text style={headerStyles.titleText}>{title}</Text>
          <Ionicons
            name={menuOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={18}
            color="#111827"
          />
        </TouchableOpacity>

        {/* 右側：+ 以及 Settings（四方格） */}
        <View style={headerStyles.rightRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGoalFlow')}
            style={headerStyles.iconBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="add-outline" size={22} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoSettings}
            style={headerStyles.iconBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="grid-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 下拉選單 */}
      {menuOpen && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
          />
          <View style={headerStyles.menu}>
            <HeaderMenuItem
              label="Dashboard"
              active={currentTab === 'Main'}
              onPress={() => handleGoTab('Main')}
            />
            <HeaderMenuItem
              label="Reports"
              active={currentTab === 'Reports'}
              onPress={() => handleGoTab('Reports')}
            />
            <HeaderMenuItem
              label="Community"
              active={currentTab === 'Community'}
              onPress={() => handleGoTab('Community')}
            />
            <View style={headerStyles.menuDivider} />
            <HeaderMenuItem label="Settings" onPress={handleGoSettings} />
          </View>
        </>
      )}
    </View>
  );
}

function HeaderMenuItem({ label, onPress, active }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[headerStyles.menuItem, active && headerStyles.menuItemActive]}
      activeOpacity={0.9}
    >
      <Text
        style={[
          headerStyles.menuItemText,
          active && headerStyles.menuItemTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------------- Root Stack ---------------- */
function RootNavigator({ isSignedIn }) {
  return (
    <RootJSStack.Navigator
      screenOptions={{
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

              return {
                header: (props) => (
                  <AppHeader
                    {...props}
                    navigation={navigation}
                    currentTab={focused}
                  />
                ),
                headerStyle: {
                  backgroundColor: '#F3F4F6',
                  elevation: 0,
                  shadowOpacity: 0,
                },
              };
            }}
          />

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

/* ---------------- Styles ---------------- */

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
    minWidth: 220,
    maxWidth: 320,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
});

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menu: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  menuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#4F46E5',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
});