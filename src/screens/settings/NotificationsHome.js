// src/screens/settings/NotificationsHome.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';

export default function NotificationsHome() {
  const { currentTheme } = useTheme();

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const toggleReminder = () => setReminderEnabled(!reminderEnabled);

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setReminderTime(selectedDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Notifications</Text>
      <Text style={[styles.caption, { color: currentTheme.colors.text }]}>
        Manage reminders and alerts
      </Text>

      {/* Daily Reminder */}
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Text style={[styles.rowTitle, { color: currentTheme.colors.label }]}>
            Daily reminder
          </Text>
          {reminderEnabled && (
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={{ color: currentTheme.colors.primary }}>
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

      {showPicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Milestone alerts - Coming soon */}
      <View style={[styles.row, styles.disabled]}>
        <Text style={[styles.rowTitle, { color: '#9CA3AF' }]}>Milestone alerts</Text>
        <Text style={{ color: '#9CA3AF' }}>Coming soon</Text>
      </View>

      {/* Friend updates - Coming soon */}
      <View style={[styles.row, styles.disabled]}>
        <Text style={[styles.rowTitle, { color: '#9CA3AF' }]}>Friend updates</Text>
        <Text style={{ color: '#9CA3AF' }}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  caption: { marginTop: 4, marginBottom: 14, fontSize: 14 },
  row: {
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  disabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
});