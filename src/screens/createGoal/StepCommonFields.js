// screens/createGoal/StepCommonFields.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function StepCommonFields({ formData, updateForm, nextStep, prevStep }) {
  const [startDate, setStartDate] = useState(formData.startDate || new Date());
  const [targetDate, setTargetDate] = useState(formData.targetDate || new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Information</Text>

      {/* 目標名稱 */}
      <TextInput
        placeholder="Goal title"
        value={formData.title}
        onChangeText={(t) => updateForm({ title: t })}
        style={styles.input}
      />

      {/* 描述 */}
      <TextInput
        placeholder="Description or motivation"
        value={formData.description}
        onChangeText={(t) => updateForm({ description: t })}
        style={[styles.input, { height: 90 }]}
        multiline
      />

      {/* 日期選擇 */}
      <View style={styles.dateRow}>
        <Button title="Select Start Date" onPress={() => setShowStartPicker(true)} />
        <Text>{startDate.toDateString()}</Text>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) {
              setStartDate(date);
              updateForm({ startDate: date });
            }
          }}
        />
      )}

      <View style={styles.dateRow}>
        <Button title="Select Target Date" onPress={() => setShowTargetPicker(true)} />
        <Text>{targetDate.toDateString()}</Text>
      </View>
      {showTargetPicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => {
            setShowTargetPicker(false);
            if (date) {
              setTargetDate(date);
              updateForm({ targetDate: date });
            }
          }}
        />
      )}

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
        <Button
          title="Next →"
          onPress={() => {
            if (!formData.title.trim()) return alert('請輸入目標名稱');
            nextStep();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});