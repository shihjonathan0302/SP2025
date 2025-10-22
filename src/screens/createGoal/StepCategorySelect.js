// screens/createGoal/StepCategorySelect.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORIES = [
  { key: 'Academic and Education', label: '🎓 Academic & Education' },
  { key: 'Career and Professional', label: '💼 Career & Professional' },
  { key: 'Personal and Lifestyle', label: '🌿 Personal & Lifestyle' },
  { key: 'Habits and Learning', label: '📘 Habits & Learning' },
];

export default function StepCategorySelect({ formData, updateFormData, nextStep }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Goal Type</Text>

      <View style={styles.list}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.option,
              formData.category === cat.key && styles.selected,
            ]}
            onPress={() => {
              updateFormData({ category: cat.key });
              nextStep(); // 選好自動進入下一步
            }}
          >
            <Text
              style={[
                styles.label,
                formData.category === cat.key && { color: '#fff' },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  list: { width: '100%', gap: 12 },
  option: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  selected: { backgroundColor: '#4a90e2' },
  label: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});