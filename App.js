// App.js
import * as React from 'react';
import { useEffect, useState } from 'react'; // ADD: 需要讀取/監聽 session
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GoalsProvider } from './contexts/GoalsContext';

// 匯入各個螢幕組件（對應不同頁面）
import MainScreen from './screens/MainScreen';
import ReportsScreen from './screens/ReportsScreen';
import SocialScreen from './screens/SocialScreen';
import GoalDetailScreen from './screens/GoalDetailScreen';
import SettingsStackNavigator from './navigation/SettingsStackNavigator';

// ADD: 匯入 Supabase client 與 Login 螢幕
import { supabase } from './supabaseClient';
import LoginScreen from './screens/LoginScreen';

// 建立 Tab Navigator 與 Stack Navigator 實例
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 定義底部標籤導航（包含 4 個主要頁面）
function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen name="Main" component={MainScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      {/* Settings 我保留你原本用的 Stack Navigator */}
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// 定義頂層 Stack Navigator（用來切換 Tabs 和詳情頁面）
// ADD: 接收 isSignedIn 來決定顯示 Login 還是 Tabs
function RootNavigator({ isSignedIn }) {
  return (
    <Stack.Navigator>
      {isSignedIn ? (
        <>
          <Stack.Screen name="RootTabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
        </>
      ) : (
        // 未登入就只顯示 Login（header 隱藏）
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

// App 入口組件
export default function App() {
  // ADD: 登入狀態（啟動時讀取一次 + 監聽變化）
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checking, setChecking] = useState(true); // 首次讀取 session 的 loading

  // App.js（只貼「差異」：useEffect 這一段替換）

  useEffect(() => {
    // 啟動時讀取現有 session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[getSession]', { hasSession: !!data?.session, error });
      setIsSignedIn(!!data?.session);
      setChecking(false);
    });

    // 之後監聽登入/登出事件
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange]', event, { hasSession: !!session });
      setIsSignedIn(!!session);
    });

    // ✅ 正確退訂：subscription.unsubscribe()
    return () => {
      try {
        subscription?.unsubscribe();
      } catch (e) {
        console.log('[unsubscribe error]', e);
      }
    };
  }, []);

  // 你可以在這裡顯示一個極簡 loading 畫面；為了簡單，先回傳 null
  if (checking) return null;

  return (
    <GoalsProvider>
      <NavigationContainer>
        {/* ADD: 傳入 isSignedIn，讓 RootNavigator 決定顯示 Login 或 Tabs */}
        <RootNavigator isSignedIn={isSignedIn} />
      </NavigationContainer>
    </GoalsProvider>
  );
}