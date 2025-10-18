// src/screens/settings/DataSecurityScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function DataSecurityScreen() {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Data & Security</Text>
      <Text style={[styles.caption, { color: currentTheme.colors.text }]}>
        Manage data export, AI personalization, and permissions settings.
      </Text>

      {/* Export Data */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Export Data (CSV)</Text>
        <Text style={styles.optionDesc}>
          Export your activity and goals as CSV files for external use.
        </Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>

      {/* AI Data Preferences */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>AI Data Preferences</Text>
        <Text style={styles.optionDesc}>
          Manage how AI uses your data to provide personalized insights and recommendations.
        </Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>

      {/* App Permissions */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>App Permissions</Text>
        <Text style={styles.optionDesc}>
          Manage access to notifications, microphone, and other system-level permissions.
        </Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  caption: { fontSize: 14, marginBottom: 20 },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionText: { fontSize: 16, fontWeight: '600' },
  optionDesc: { fontSize: 13, lineHeight: 18, color: '#9CA3AF' },
  soonText: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  disabled: {
    opacity: 0.8,
    borderColor: '#e5e7eb',
  },
});