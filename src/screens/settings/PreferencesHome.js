// src/screens/settings/PreferencesHome.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PreferencesHome({ navigation }) {
  const go = (name) => navigation.navigate(name);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferences</Text>
      <Text style={styles.caption}>Customize how the app looks and behaves.</Text>

      {/* Theme → 可點擊 */}
      <Row
        icon="color-palette-outline"
        title="Theme"
        onPress={() => go('PreferencesTheme')}
      />

      {/* Language → Coming soon */}
      <Row
        icon="language-outline"
        title="Language"
        disabled
        comingSoon
      />

      {/* Goal Tracking Style → Coming soon */}
      <Row
        icon="trending-up-outline"
        title="Goal Tracking Style"
        disabled
        comingSoon
      />
    </View>
  );
}

/* ----------------- Row component ----------------- */
function Row({ icon, title, onPress, disabled, comingSoon }) {
  const handlePress = () => {
    if (!disabled && onPress) onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.row, disabled && styles.rowDisabled]}
      activeOpacity={0.8}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.ic, disabled && styles.icDisabled]}>
          <Ionicons
            name={icon}
            size={18}
            color={disabled ? '#9CA3AF' : '#111'}
          />
        </View>
        <Text style={[styles.rowTitle, disabled && { color: '#9CA3AF' }]}>
          {title}
        </Text>
      </View>

      {comingSoon ? (
        <Text style={styles.comingSoon}>Coming soon</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}

/* ----------------- Styles ----------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  caption: { color: '#6B7280', marginTop: 4, marginBottom: 14 },

  row: {
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDisabled: { backgroundColor: '#FAFAFA' },

  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ic: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  icDisabled: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },

  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  comingSoon: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
});