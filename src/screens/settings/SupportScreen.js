// src/screens/settings/SupportScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function SupportScreen() {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Support</Text>
      <Text style={[styles.caption, { color: currentTheme.colors.text }]}>
        Get help, contact our team, or browse FAQs.
      </Text>

      {/* Help & FAQ */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Help & FAQ</Text>
        <Text style={styles.optionDesc}>
          Common questions and troubleshooting guides.
        </Text>
        <Text style={styles.soonText}>Coming soon</Text>
      </View>

      {/* Contact Support */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Contact Support</Text>
        <Text style={styles.optionDesc}>
          Reach out to our team for help or feedback.
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