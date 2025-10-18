// src/screens/settings/PrivacySharingScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrivacySharingScreen() {
  const { currentTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Title & description */}
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Privacy & Sharing</Text>
      <Text style={[styles.caption, { color: currentTheme.colors.text }]}>
        Manage how your data and activity are shared with others.
      </Text>

      {/* Share activity */}
      <View style={[styles.option, styles.disabled]}>
        <View style={styles.optionLeft}>
          <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Share activity with friends</Text>
          <Text style={styles.optionDesc}>
            Allow your friends to view your goal progress and milestones.
          </Text>
          <Text style={styles.soonText}>Coming soon</Text>
        </View>
      </View>

      {/* Friend requests */}
      <View style={[styles.option, styles.disabled]}>
        <View style={styles.optionLeft}>
          <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Allow friend requests</Text>
          <Text style={styles.optionDesc}>
            Control whether others can send you friend requests.
          </Text>
          <Text style={styles.soonText}>Coming soon</Text>
        </View>
      </View>

      {/* Personalized insights */}
      <View style={[styles.option, styles.disabled]}>
        <View style={styles.optionLeft}>
          <Text style={[styles.optionText, { color: '#9CA3AF' }]}>Personalized insights</Text>
          <Text style={styles.optionDesc}>
            Enable AI-based suggestions and performance feedback using your in-app activity.
          </Text>
          <Text style={styles.soonText}>Coming soon</Text>
        </View>
      </View>

      {/* Data usage summary */}
      <View style={[styles.infoBox, { borderColor: '#e5e7eb' }]}>
        <Text style={[styles.infoTitle, { color: currentTheme.colors.label }]}>Data usage summary</Text>
        <Text style={[styles.infoText, { color: currentTheme.colors.text }]}>
          Your data is only used to provide insights and analytics to enhance your experience.
          We do not share, sell, or expose your personal data to any third party.
        </Text>
      </View>

      {/* Placeholder link */}
      <View style={styles.learnMore}>
        <Text style={[styles.learnText, { color: currentTheme.colors.primary }]}>
          Learn more about privacy policy →
        </Text>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
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
  optionLeft: { flexDirection: 'column', gap: 4 },
  optionText: { fontSize: 16, fontWeight: '600' },
  optionDesc: { fontSize: 13, lineHeight: 18, color: '#9CA3AF' },
  soonText: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  disabled: {
    opacity: 0.8,
    borderColor: '#e5e7eb',
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#F9FAFB',
    marginTop: 16,
  },
  infoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  infoText: { fontSize: 13, lineHeight: 18 },
  learnMore: { marginTop: 18, alignItems: 'center' },
  learnText: { fontSize: 14, fontWeight: '600' },
});