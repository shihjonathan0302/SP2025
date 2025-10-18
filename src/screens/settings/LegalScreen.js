// src/screens/settings/LegalScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function LegalScreen() {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Legal</Text>
      <Text style={[styles.caption, { color: currentTheme.colors.text }]}>
        Review the terms and policies that govern the use of this app.
      </Text>

      {/* Terms of Service */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Terms of Service</Text>
        <Text style={styles.optionDesc}>
          Read the terms that outline your rights and responsibilities.
        </Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>

      {/* Privacy Policy */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Privacy Policy</Text>
        <Text style={styles.optionDesc}>
          Learn how we collect, store, and protect your personal data.
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