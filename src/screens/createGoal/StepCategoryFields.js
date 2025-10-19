// screens/createGoal/StepCategoryFields.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const FIELD_CONFIG = {
  'Academic and Education': [
    { key: 'examType', label: 'Exam or Certification Type' },
    { key: 'subject', label: 'Main Subject or Focus Area' },
  ],
  'Career and Professional': [
    { key: 'careerGoal', label: 'Career Goal (e.g., promotion, job change)' },
    { key: 'skills', label: 'Skills you want to develop' },
  ],
  'Personal and Lifestyle': [
    { key: 'area', label: 'Focus Area (e.g., fitness, relationships, travel)' },
    { key: 'habit', label: 'Specific Habit or Routine' },
  ],
  'Habits and Learning': [
    { key: 'habitType', label: 'Type of Habit (daily, weekly)' },
    { key: 'topic', label: 'Learning Topic (e.g., language, coding)' },
  ],
};

export default function StepCategoryFields({ formData, updateForm, nextStep, prevStep }) {
  const [local, setLocal] = useState(formData.categoryFields || {});
  const fields = FIELD_CONFIG[formData.category] || [];

  const handleNext = () => {
    updateForm({ categoryFields: local });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Additional Details</Text>
      {fields.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#666' }}>No extra questions.</Text>
      ) : (
        fields.map((f) => (
          <View key={f.key} style={{ marginBottom: 12 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              placeholder={f.label}
              value={local[f.key] || ''}
              onChangeText={(t) => setLocal((prev) => ({ ...prev, [f.key]: t }))}
              style={styles.input}
            />
          </View>
        ))
      )}

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
        <Button title="Next →" onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});