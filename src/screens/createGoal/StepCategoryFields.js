// screens/createGoal/StepCategoryFields.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function StepCategoryFields({ formData, updateFormData, nextStep, prevStep }) {
  const [localDetails, setLocalDetails] = useState(formData.details || {});

  // 🔹 各類型專屬欄位定義
  const FIELD_CONFIG = {
    'Academic and Education': [
      { key: 'academic_type', label: 'Academic Type', placeholder: 'Exam / Thesis / Research Project' },
      { key: 'exam_name', label: 'Exam or Subject Name', placeholder: 'TOEFL / GRE Quant / Research Topic' },
      { key: 'target_score', label: 'Target Score or Result', placeholder: 'Ex: 100 on TOEFL' },
      { key: 'study_frequency', label: 'Study Frequency', placeholder: 'Ex: 4 days per week' },
      { key: 'session_time', label: 'Available Time per Session', placeholder: 'Ex: 2 hours' },
      { key: 'resources', label: 'Resources Available', placeholder: 'Ex: Official Guide + YouTube lectures' },
    ],

    'Career and Professional': [
      { key: 'goal_type', label: 'Career Goal Type', placeholder: 'Find internship / Career switch / Start business' },
      { key: 'field', label: 'Field / Industry', placeholder: 'Ex: Data Analytics / Marketing' },
      { key: 'experience_level', label: 'Current Experience Level', placeholder: 'Ex: Undergraduate / Entry-level' },
      { key: 'deliverable', label: 'Expected Deliverable', placeholder: 'Ex: Resume + Portfolio' },
      { key: 'timeline_goal', label: 'Timeline Goal', placeholder: 'Ex: By March 2026' },
      { key: 'hours_per_week', label: 'Available Hours per Week', placeholder: 'Ex: 10 hours/week' },
    ],

    'Personal and Lifestyle': [
      { key: 'goal_category', label: 'Personal Goal Category', placeholder: 'Fitness / Financial Saving / Travel Plan' },
      { key: 'quantifiable_target', label: 'Quantifiable Target (if any)', placeholder: 'Ex: Reach 72kg / Save NT$50,000' },
      { key: 'focus_type', label: 'Routine or Milestone Focus?', placeholder: 'Daily habit / One-time goal' },
      { key: 'constraint', label: 'Main Constraint', placeholder: 'Busy schedule / Limited budget' },
      { key: 'motivation_style', label: 'Motivation Style', placeholder: 'Visual progress / Rewards' },
    ],

    'Habits and Learning': [
      { key: 'habit_type', label: 'Habit or Skill to Build', placeholder: 'Read 20 min / Learn Japanese' },
      { key: 'frequency', label: 'Frequency', placeholder: 'Daily / 3x per week' },
      { key: 'duration', label: 'Duration per Session', placeholder: '30 minutes' },
      { key: 'method', label: 'Learning Method', placeholder: 'Duolingo / YouTube / Tutor' },
      { key: 'trigger', label: 'Motivation or Trigger', placeholder: 'Prepare for exchange / improve focus' },
      { key: 'current_level', label: 'Current Skill Level', placeholder: 'Beginner / Intermediate / Advanced' },
    ],
  };

  const fields = FIELD_CONFIG[formData.category] || [];

  const handleNext = () => {
    updateFormData({ details: localDetails });
    nextStep();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Additional Details</Text>
      <Text style={styles.subtitle}>
        Please provide a few details about your goal. This helps the AI create a more personalized roadmap.
      </Text>

      {fields.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#666' }}>
          No specific questions for this category.
        </Text>
      ) : (
        fields.map((f) => (
          <View key={f.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              placeholder={f.placeholder}
              value={localDetails[f.key] || ''}
              onChangeText={(t) => setLocalDetails((prev) => ({ ...prev, [f.key]: t }))}
              style={styles.input}
            />
          </View>
        ))
      )}

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
        <Button title="Next →" onPress={handleNext} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  fieldContainer: { marginBottom: 15 },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});