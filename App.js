import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MainScreen from './screens/MainScreen';
import ReportsScreen from './screens/ReportsScreen';
import SocialScreen from './screens/SocialScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <React.Fragment>
          <Tab.Screen name="Main" component={MainScreen} />
          <Tab.Screen name="Reports" component={ReportsScreen} />
          {/* 如果還是有問題，先用下面這行暫時測試： */}
          {/* <Tab.Screen name="Reports" component={ReportsInline} /> */}
          <Tab.Screen name="Social" component={SocialScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </React.Fragment>
      </Tab.Navigator>
    </NavigationContainer>
  );
}