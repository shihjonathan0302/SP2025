// screens/createGoal/StepCommon_Page2.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function StepCommon_Page2({ formData, updateFormData, goNextPage, goPrevPage }) {
  const [phase, setPhase] = useState(Number(formData.numPhases ?? 3));

  useEffect(() => {
    updateFormData({ numPhases: phase });
  }, [phase]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Setup</Text>

      {/* Priority */}
      <Text style={styles.label}>Priority Level</Text>
      <View style={styles.optionRow}>
        {PRIORITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => updateFormData({ priority: opt })}
            style={[styles.optionBtn, formData.priority === opt && styles.optionSelected]}
          >
            <Text
              style={[
                styles.optionText,
                formData.priority === opt && styles.optionTextSelected,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Phases with slider (1~5) */}
      <Text style={[styles.label, { marginTop: 8 }]}>Number of Phases</Text>
      <Text style={styles.hint}>
        A phase represents one major stage of your goal — for example: “Preparation”, “Execution”, or “Review”
      </Text>

      <View style={{ paddingHorizontal: 6, marginTop: 6 }}>
        <Slider
          value={phase}
          onValueChange={(v) => setPhase(Math.round(v))}
          step={1}
          minimumValue={1}
          maximumValue={5}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#2563EB"
        />
        <View style={styles.sliderMarks}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Text key={n} style={[styles.mark, phase === n && styles.markActive]}>
              {n}
            </Text>
          ))}
        </View>
      </View>

      {/* Nav */}
      <View style={styles.navBtns}>
        <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
          <Text style={styles.navBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={goNextPage}>
          <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  label: { fontWeight: '700', color: '#111827', marginBottom: 6 },
  hint: { color: '#6B7280', marginBottom: 6 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  optionSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  optionText: { color: '#374151', fontWeight: '600' },
  optionTextSelected: { color: '#fff' },
  sliderMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 6,
  },
  mark: { color: '#6B7280', fontWeight: '600' },
  markActive: { color: '#111827' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
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