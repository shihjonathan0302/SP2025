// screens/createGoal/StepCommon_Page1.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// 不同類別的 Goal Name placeholder
function getGoalPlaceholder(category) {
  switch (category) {
    case 'Academic and Education':
      return 'Ex: Pass TOEFL exam (Target 100)';
    case 'Career and Professional':
      return 'Ex: Land a marketing internship';
    case 'Personal and Lifestyle':
      return 'Ex: Reach 72kg by Dec / Save NT$50,000';
    case 'Habits and Learning':
      return 'Ex: Learn Japanese 30 min/day';
    default:
      return 'Ex: Pass TOEFL exam';
  }
}

// Web 專用 date input
function WebDateInput({ value, onChange }) {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  const v = `${yyyy}-${mm}-${dd}`;

  return (
    <input
      type="date"
      value={v}
      onChange={(e) => {
        const next = e.target.value; // yyyy-mm-dd
        const [y, m, d] = next.split('-').map((n) => parseInt(n, 10));
        if (y && m && d) onChange(new Date(y, m - 1, d));
      }}
      style={{
        width: '100%',
        height: 44,
        border: '1px solid #D1D5DB',
        borderRadius: 10,
        padding: '0 12px',
        background: '#fff',
        color: '#111827',
      }}
    />
  );
}

export default function StepCommon_Page1({ formData, updateFormData, goNextPage, goPrevPage }) {
  const [startDate, setStartDate] = useState(formData.startDate ? new Date(formData.startDate) : new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  // 自動維持 etaDays（若你保留 Estimated Timeframe 為純文字，etaDays 可在 Review/送出前再計算）
  useEffect(() => {
    updateFormData({ startDate });
  }, [startDate]);

  const placeholder = useMemo(() => getGoalPlaceholder(formData.category), [formData.category]);

  const onNext = () => {
    const title = (formData.title || '').trim();
    if (!title) {
      alert('請輸入目標名稱');
      return;
    }
    goNextPage();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Goal Basics</Text>

        {/* Goal Name */}
        <Text style={styles.label}>Goal Name</Text>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={formData.title ?? ''}
          onChangeText={(t) => updateFormData({ title: t })}
          style={styles.input}
          returnKeyType="next"
        />

        {/* Estimated Timeframe（純文字描述） */}
        <Text style={styles.label}>Estimated Timeframe</Text>
        <TextInput
          placeholder="Ex: 3 months / By Dec 2025"
          placeholderTextColor="#9CA3AF"
          value={formData.estimatedTime ?? ''}
          onChangeText={(t) => updateFormData({ estimatedTime: t })}
          style={styles.input}
          returnKeyType="done"
        />

        {/* Start Date */}
        <Text style={styles.label}>Start Date</Text>
        {Platform.OS === 'web' ? (
          <WebDateInput value={startDate} onChange={setStartDate} />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.dateBtn, styles.input]}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#111827' }}>{startDate.toDateString()}</Text>
              <Text style={{ color: '#6B7280' }}>Tap to select</Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => {
                  setShowStartPicker(false);
                  if (d) setStartDate(d);
                }}
              />
            )}
          </>
        )}

        {/* Nav Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity style={[styles.navBtn]} onPress={goPrevPage}>
            <Text style={styles.navBtnText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={onNext}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: '600', color: '#374151', marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
});