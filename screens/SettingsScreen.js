// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Platform } from 'react-native';
// ADD: 匯入 supabase client
import { supabase } from '../supabaseClient';

// 原有選項
const settingsOptions = [
  { id: 'EditProfile', title: 'Edit Profile' },
  { id: 'ChangePassword', title: 'Change Password' },
  { id: 'NotificationSettings', title: 'Notification Settings' },
  { id: 'PrivacySettings', title: 'Privacy Settings' },
  { id: 'LanguageSettings', title: 'Language Settings' },
  { id: 'About', title: 'About' },
  // ADD: Sign Out 選項
  { id: 'SignOut', title: 'Sign Out' },
];

export default function SettingsScreen({ navigation }) {
  // 小幫手：做真正的登出
  const doSignOut = async (origin = 'unknown') => {
    try {
      console.log(`[SignOut] start (${origin})`);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('[SignOut] error:', error);
        // Web 用 alert、Native 用 Alert 都 OK
        if (Platform.OS === 'web') {
          window.alert?.(`登出失敗：${error.message}`);
        } else {
          Alert.alert('登出失敗', error.message);
        }
        return;
      }
      console.log('[SignOut] success');
      // 成功後交給 App.js 的 onAuthStateChange 自動回 Login
    } catch (e) {
      console.log('[SignOut] exception:', e);
      if (Platform.OS === 'web') {
        window.alert?.(`登出失敗：${String(e)}`);
      } else {
        Alert.alert('登出失敗', String(e));
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (item.id === 'SignOut') {
          // ✅ Web：用 confirm；Native：用 Alert.alert 兩顆按鈕
          if (Platform.OS === 'web') {
            const ok = window.confirm?.('確定要登出嗎？');
            if (!ok) return;
            doSignOut('web-confirm');
          } else {
            Alert.alert('確認登出', '確定要登出嗎？', [
              { text: '取消', style: 'cancel' },
              { text: '登出', style: 'destructive', onPress: () => doSignOut('native-alert') },
            ]);
          }
        } else {
          navigation.navigate(item.id);
        }
      }}
    >
      <Text
        style={[
          styles.itemText,
          item.id === 'SignOut' && { color: '#c0392b', fontWeight: 'bold' }, // Sign Out 樣式
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: { fontSize: 16 },
});