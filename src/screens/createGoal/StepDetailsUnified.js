// screens/createGoal/StepDetailsUnified.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

const MAX_ADDITIONAL = 280;

export default function StepDetailsUnified({ formData, updateFormData, goPrevPage, goNextPage }) {
  const [localDetails, setLocalDetails] = useState(formData.details || {});
  const category = formData.category;

  /* ---------------- 類別專屬欄位（只保留精簡版） ---------------- */
  const CATEGORY_FIELDS = useMemo(() => {
    switch (category) {
      case 'Academic and Education':
        return [
          { key: 'exam_name', label: 'Exam or Project', placeholder: 'Ex: TOEFL, Thesis, or Research' },
          { key: 'target_score', label: 'Target Result', placeholder: 'Ex: Score 100 / Submit by Dec' },
          { key: 'study_plan', label: 'Study or Work Plan', placeholder: 'Ex: 2 hours a day, 5 days/week' },
        ];
      case 'Career and Professional':
        return [
          { key: 'goal_type', label: 'Career Goal Type', placeholder: 'Ex: Internship / Portfolio project' },
          { key: 'industry', label: 'Field / Industry', placeholder: 'Ex: Marketing / Data Analytics' },
          { key: 'timeline', label: 'Timeline or Target Date', placeholder: 'Ex: By March 2026' },
        ];
      case 'Personal and Lifestyle':
        return [
          { key: 'goal_type', label: 'Goal Type', placeholder: 'Ex: Fitness / Finance / Travel' },
          { key: 'target', label: 'Target or Result', placeholder: 'Ex: Reach 72kg / Save $50,000' },
          { key: 'routine', label: 'Routine Plan', placeholder: 'Ex: Gym 3x/week, Track meals' },
        ];
      case 'Habits and Learning':
        return [
          { key: 'habit_type', label: 'Habit or Skill', placeholder: 'Ex: Learn Japanese / Daily reading' },
          { key: 'frequency', label: 'Frequency', placeholder: 'Ex: 30 min per day / 3x a week' },
          { key: 'method', label: 'Method or Tool', placeholder: 'Ex: Duolingo / Online course' },
        ];
      default:
        return [];
    }
  }, [category]);

  /* ---------------- 共通輸入欄位 ---------------- */
  const desc = formData.description ?? '';
  const motive = formData.motivation ?? '';
  const extra = formData.additionalInfo ?? '';

  const handleNext = () => {
    updateFormData({
      description: desc,
      motivation: motive,
      additionalInfo: extra,
      details: localDetails,
    });
    goNextPage();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Goal Details</Text>
        <Text style={styles.subtitle}>Add context to make your plan more personalized.</Text>

        {/* ---------------- 共通欄位 ---------------- */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          placeholder="Brief background or constraints"
          placeholderTextColor="#9CA3AF"
          value={desc}
          onChangeText={(t) => updateFormData({ description: t })}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Motivation (optional)</Text>
        <TextInput
          placeholder="Why this goal matters to you"
          placeholderTextColor="#9CA3AF"
          value={motive}
          onChangeText={(t) => updateFormData({ motivation: t })}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Additional Info (optional)</Text>
        <TextInput
          placeholder="Any other context (≤ 280 chars)"
          placeholderTextColor="#9CA3AF"
          value={extra}
          onChangeText={(t) =>
            updateFormData({ additionalInfo: t.slice(0, MAX_ADDITIONAL) })
          }
          style={[styles.input, styles.multiline]}
          multiline
          maxLength={MAX_ADDITIONAL}
        />
        <Text style={styles.counter}>{(extra ?? '').length} / {MAX_ADDITIONAL}</Text>

        {/* ---------------- 類別欄位 ---------------- */}
        {CATEGORY_FIELDS.length > 0 && (
          <>
            <Text style={[styles.subHeader, { marginTop: 18 }]}>
              Category-specific questions
            </Text>
            {CATEGORY_FIELDS.map((f) => (
              <View key={f.key} style={styles.fieldContainer}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  placeholder={f.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={localDetails[f.key] || ''}
                  onChangeText={(t) => setLocalDetails((prev) => ({ ...prev, [f.key]: t }))}
                  style={[styles.input, { backgroundColor: '#fff' }]}
                />
              </View>
            ))}
          </>
        )}

        {/* ---------------- 導航按鈕 ---------------- */}
        <View style={styles.navBtns}>
          <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
            <Text style={styles.navBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleNext}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 16 },
  label: { fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  counter: { textAlign: 'right', color: '#6B7280', marginTop: 4 },
  subHeader: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  fieldContainer: { marginBottom: 14 },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
});
