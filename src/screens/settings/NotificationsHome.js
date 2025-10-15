// src/screens/settings/NotificationsHome.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';

// ✅ 全域通知設定（一定要有）
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationsHome() {
  const { currentTheme } = useTheme();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // ✅ 載入儲存的狀態
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('dailyReminderEnabled');
      const savedTime = await AsyncStorage.getItem('dailyReminderTime');
      if (saved === 'true') setReminderEnabled(true);
      if (savedTime) setReminderTime(new Date(savedTime));
    })();
  }, []);

  const toggleReminder = async () => {
    const newValue = !reminderEnabled;
    setReminderEnabled(newValue);
    await AsyncStorage.setItem('dailyReminderEnabled', newValue ? 'true' : 'false');

    if (Platform.OS === 'web') return;

    if (newValue) {
      await Notifications.cancelAllScheduledNotificationsAsync(); // 先清空避免重疊
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Reminder',
          body: 'Time to check your goals ✨',
        },
        trigger: {
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true,
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const onTimeChange = async (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setReminderTime(selectedDate);
      await AsyncStorage.setItem('dailyReminderTime', selectedDate.toISOString());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.header, { color: currentTheme.colors.label }]}>Notifications</Text>
      <Text style={[styles.subText, { color: currentTheme.colors.text }]}>
        Manage reminders and alerts.
      </Text>

      {/* Daily Reminder */}
      <View style={[styles.option, { borderColor: '#E5E7EB', backgroundColor: '#fff' }]}>
        <View style={styles.optionLeft}>
          <Text style={[styles.optionText, { color: currentTheme.colors.label }]}>
            Daily reminder
          </Text>
          {reminderEnabled && (
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={[styles.timeText, { color: currentTheme.colors.primary }]}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={toggleReminder}
          trackColor={{ false: '#d1d5db', true: currentTheme.colors.primary }}
          thumbColor={reminderEnabled ? currentTheme.colors.primary : '#f4f3f4'}
        />
      </View>

      {Platform.OS !== 'web' && showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Milestone Alerts */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Milestone alerts</Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>

      {/* Friend Updates */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Friend updates</Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subText: { fontSize: 14, marginBottom: 20 },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: { flexDirection: 'column', gap: 4 },
  optionText: { fontSize: 16, fontWeight: '600' },
  timeText: { fontSize: 14, fontWeight: '500' },
  disabled: {
    opacity: 0.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  soonText: { fontSize: 14, color: '#9CA3AF' },
});