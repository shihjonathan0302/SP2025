// screens/createGoal/StepCategorySelect.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CATEGORIES = [
  { key: 'Academic and Education', label: '🎓 Academic & Education', desc: 'Exams, research, or academic progress' },
  { key: 'Career and Professional', label: '💼 Career & Professional', desc: 'Internships, skills, or portfolio' },
  { key: 'Personal and Lifestyle', label: '🌿 Personal & Lifestyle', desc: 'Fitness, travel, or health goals' },
  { key: 'Habits and Learning', label: '📘 Habits & Learning', desc: 'Daily learning or new habits' },
];

export default function StepCategorySelect({ formData, updateFormData, nextStep }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select a Goal Type</Text>

      {CATEGORIES.map((cat, idx) => {
        const selected = formData.category === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[styles.option, selected && styles.selected]}
            onPress={() => {
              updateFormData({ category: cat.key });
              nextStep();
            }}
          >
            <Text style={[styles.label, selected && { color: '#2563EB' }]}>{cat.label}</Text>
            <Text style={[styles.desc, selected && { color: '#1D4ED8' }]}>{cat.desc}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 14,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  selected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  desc: {
    fontSize: 14,
    color: '#6B7280',
  },
});