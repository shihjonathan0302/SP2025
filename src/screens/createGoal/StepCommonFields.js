// screens/createGoal/StepCommonFields.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function StepCommonFields({ formData, updateFormData, nextStep, prevStep }) {
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [targetDate, setTargetDate] = useState(formData.targetDate || new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  // ✅ 自動計算天數（etaDays）
  useEffect(() => {
    const days = Math.max(
      1,
      Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    updateFormData({ etaDays: days });
  }, [startDate, targetDate]);

  const handleNext = () => {
    if (!formData.title?.trim()) {
      Alert.alert('提醒', '請輸入目標名稱');
      return;
    }
    updateFormData({ startDate, targetDate });
    nextStep();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Information</Text>

      {/* Goal Name */}
      <Text style={styles.label}>Goal Name</Text>
      <TextInput
        placeholder="Ex: Pass TOEFL exam"
        value={formData.title}
        onChangeText={(t) => updateFormData({ title: t })}
        style={styles.input}
      />

      {/* Estimated Timeframe */}
      <Text style={styles.label}>Estimated Timeframe</Text>
      <TextInput
        placeholder="Ex: 3 months / By Dec 2025"
        value={formData.estimatedTime}
        onChangeText={(t) => updateFormData({ estimatedTime: t })}
        style={styles.input}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Optional background or context"
        value={formData.description}
        onChangeText={(t) => updateFormData({ description: t })}
        style={[styles.input, { height: 70 }]}
        multiline
      />

      {/* Motivation */}
      <Text style={styles.label}>Motivation / Why this goal?</Text>
      <TextInput
        placeholder="Ex: To improve my grad school profile"
        value={formData.motivation}
        onChangeText={(t) => updateFormData({ motivation: t })}
        style={[styles.input, { height: 70 }]}
        multiline
      />

      {/* Priority */}
      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.priorityRow}>
        {PRIORITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => updateFormData({ priority: opt })}
            style={[
              styles.priorityBtn,
              formData.priority === opt && styles.prioritySelected,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                formData.priority === opt && styles.priorityTextSelected,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dates */}
      <Text style={styles.label}>Start Date</Text>
      <Button title={startDate.toDateString()} onPress={() => setShowStartPicker(true)} />
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

      <Text style={styles.label}>Target Date</Text>
      <Button title={targetDate.toDateString()} onPress={() => setShowTargetPicker(true)} />
      {showTargetPicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => {
            setShowTargetPicker(false);
            if (d) setTargetDate(d);
          }}
        />
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
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  priorityBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
  },
  prioritySelected: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  priorityText: { color: '#333', fontWeight: '600' },
  priorityTextSelected: { color: '#fff' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});