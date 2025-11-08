// screens/createGoal/StepCategoryDetails_Page2.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

/* ---------- 主元件 ---------- */
export default function StepCategoryDetails_Page2({ formData, updateFormData, goPrevPage, goNextPage }) {
  const prevDetails = formData.categoryDetails || {};

  // 「補充說明」欄位
  const [additionalInfo, setAdditionalInfo] = useState('');

  // 預填
  useEffect(() => {
    if (!prevDetails.__filled) return;
    setAdditionalInfo(prevDetails.additional_info || '');
  }, []);

  const onNext = () => {
    const payload = {
      ...prevDetails,
      __filled: true,
      additional_info: additionalInfo.trim(),
    };
    updateFormData({ categoryDetails: payload });
    goNextPage();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Additional Information</Text>
        <Text style={styles.subtitle}>
          Add any notes or context you'd like the AI to consider when generating your goal plan.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="(Optional) Describe specific constraints, background, or preferences..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          textAlignVertical="top"
        />

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
            <Text style={styles.navBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={onNext}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- 樣式 ---------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    fontSize: 15,
    minHeight: 160,
    color: '#111827',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});