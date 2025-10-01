import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function PreferencesThemeScreen() {
  const { theme, setLight, setDark, currentTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.label }]}>Choose Theme</Text>

      <TouchableOpacity
        style={[styles.option, theme === 'light' && styles.optionActive]}
        onPress={setLight}
      >
        <Text style={[
          styles.optionText,
          { color: theme === 'light' ? currentTheme.colors.primary : currentTheme.colors.label }
        ]}>
          Light
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, theme === 'dark' && styles.optionActive]}
        onPress={setDark}
      >
        <Text style={[
          styles.optionText,
          { color: theme === 'dark' ? currentTheme.colors.primary : currentTheme.colors.label }
        ]}>
          Dark
        </Text>
      </TouchableOpacity>

      {/* System Theme (Coming soon) */}
      <View style={[styles.option, styles.disabled]}>
        <Text style={[styles.optionText, { color: '#9CA3AF' }]}>System (Coming soon)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  optionText: { fontSize: 16, fontWeight: '600' },
  disabled: {
    opacity: 0.5,
    borderColor: '#e5e7eb',
  },
});