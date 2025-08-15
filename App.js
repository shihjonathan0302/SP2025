// App.js
import * as React from 'react';
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
      <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

// 定義頂層 Stack Navigator（用來切換 Tabs 和詳情頁面）
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RootTabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
    </Stack.Navigator>
  );
}

// App 入口組件
export default function App() {
  return (
    <GoalsProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GoalsProvider>
  );
}