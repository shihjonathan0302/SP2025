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
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

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

export default function StepCommon_Page1({ formData, updateFormData, goNextPage, goPrevPage }) {
  const [startDate, setStartDate] = useState(
    formData.startDate ? new Date(formData.startDate) : new Date()
  );
  const [showStartPicker, setShowStartPicker] = useState(false);

  // timeframe
  const [timeMode, setTimeMode] = useState(formData.timeMode || 'months'); // 'months' or 'deadline'
  const [months, setMonths] = useState(formData.months || 3);
  const [targetDate, setTargetDate] = useState(
    formData.targetDate ? new Date(formData.targetDate) : new Date()
  );
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  useEffect(() => {
    updateFormData({ startDate, targetDate, months, timeMode });
  }, [startDate, targetDate, months, timeMode]);

  const placeholder = useMemo(() => getGoalPlaceholder(formData.category), [formData.category]);

  const onNext = () => {
    const title = (formData.title || '').trim();
    if (!title) return alert('請輸入目標名稱');
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
        />

        {/* Estimated Timeframe */}
        <Text style={styles.label}>Estimated Timeframe</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, timeMode === 'months' && styles.toggleSelected]}
            onPress={() => setTimeMode('months')}
          >
            <Text
              style={[styles.toggleText, timeMode === 'months' && styles.toggleTextSelected]}
            >
              By duration (months)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, timeMode === 'deadline' && styles.toggleSelected]}
            onPress={() => setTimeMode('deadline')}
          >
            <Text
              style={[styles.toggleText, timeMode === 'deadline' && styles.toggleTextSelected]}
            >
              By specific date
            </Text>
          </TouchableOpacity>
        </View>

        {timeMode === 'months' ? (
          <View style={styles.durationBox}>
            <Text style={{ color: '#111827', fontWeight: '600', marginBottom: 6 }}>
              Duration: {months} month{months > 1 ? 's' : ''}
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={12}
              step={1}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#2563EB"
              value={months}
              onValueChange={(v) => setMonths(Math.round(v))}
            />
            <Text style={styles.hint}>Drag to set how long you want this goal to last (1–12 months)</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.dateBtn, styles.input]}
            onPress={() => setShowTargetPicker(true)}
          >
            <Text style={{ color: '#111827' }}>
              {targetDate.toDateString()}
            </Text>
            <Text style={{ color: '#6B7280' }}>Tap to pick date</Text>
          </TouchableOpacity>
        )}

        {/* target date modal */}
        {showTargetPicker && (
          <Modal transparent animationType="fade" visible={showTargetPicker}>
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <DateTimePicker
                  value={targetDate}
                  mode="date"
                  display="spinner"
                  onChange={(e, d) => {
                    if (Platform.OS !== 'ios') setShowTargetPicker(false);
                    if (d) setTargetDate(d);
                  }}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setShowTargetPicker(false)}
                  >
                    <Text style={{ color: '#2563EB', fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}

        {/* Start Date */}
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={[styles.dateBtn, styles.input]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={{ color: '#111827' }}>{startDate.toDateString()}</Text>
          <Text style={{ color: '#6B7280' }}>Tap to pick start</Text>
        </TouchableOpacity>

        {/* start date modal */}
        {showStartPicker && (
          <Modal transparent animationType="fade" visible={showStartPicker}>
            <View style={styles.modalCenter}>
              <View style={styles.modalCard}>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="spinner"
                  onChange={(e, d) => {
                    if (Platform.OS !== 'ios') setShowStartPicker(false);
                    if (d) setStartDate(d);
                  }}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setShowStartPicker(false)}
                  >
                    <Text style={{ color: '#2563EB', fontWeight: '600' }}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}

        {/* Nav Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
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

/* ---------------- Styles ---------------- */
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
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  toggleSelected: { backgroundColor: '#2563EB15', borderColor: '#2563EB' },
  toggleText: { textAlign: 'center', color: '#111827', fontWeight: '600' },
  toggleTextSelected: { color: '#2563EB' },
  durationBox: { alignItems: 'center', marginTop: 6 },
  hint: { color: '#6B7280', marginTop: 6, textAlign: 'center' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  modalCenter: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, width: 300, alignItems: 'center',
  },
  doneBtn: { marginTop: 10 },
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