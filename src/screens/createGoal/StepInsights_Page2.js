// screens/createGoal/StepInsights_Page2.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

/* ---------- 小元件 ---------- */
function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}
function MultiChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}
function Section({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

/* ---------- 環境依類別 ---------- */
const ENV_BY_CAT = {
  'Academic and Education': [
    { key: 'home', label: 'Home' },
    { key: 'library', label: 'Library' },
    { key: 'study_room', label: 'Study room' },
    { key: 'pc_required', label: 'PC required' },
    { key: 'offline_ok', label: 'Offline ok' },
    { key: 'other', label: 'Other' },
  ],
  'Career and Professional': [
    { key: 'home', label: 'Home' },
    { key: 'cowork', label: 'Cowork space' },
    { key: 'office', label: 'Office-like' },
    { key: 'pc_required', label: 'PC required' },
    { key: 'interview_env', label: 'Interview env' },
    { key: 'other', label: 'Other' },
  ],
  'Personal and Lifestyle': [
    { key: 'home', label: 'Home' },
    { key: 'outdoor', label: 'Outdoor' },
    { key: 'kitchen', label: 'Kitchen' },
    { key: 'finance_tools', label: 'Finance tools' },
    { key: 'other', label: 'Other' },
  ],
  'Habits and Learning': [
    { key: 'home', label: 'Home' },
    { key: 'library', label: 'Library' },
    { key: 'music_room', label: 'Music room' },
    { key: 'pc_required', label: 'PC required' },
    { key: 'mobile_ok', label: 'Mobile ok' },
    { key: 'other', label: 'Other' },
  ],
};

export default function StepInsights_Page2({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;
  const existing = formData.insights || {};

  const [hoursPerWeek, setHoursPerWeek] = useState(
    typeof existing.hours_per_week === 'number' ? existing.hours_per_week : 4
  );

  const [cadence, setCadence] = useState(existing.cadence || 'weekly'); // daily | weekly | biweekly | x_per_week
  const [xPerWeek, setXPerWeek] = useState(
    typeof existing.x_per_week === 'number' ? existing.x_per_week : 3
  );

  const envOptions = useMemo(() => ENV_BY_CAT[cat] || [], [cat]);
  const [environment, setEnvironment] = useState(existing.environment || []);
  const [envOther, setEnvOther] = useState(existing.environment_other || '');
  const [additionalInfo, setAdditionalInfo] = useState(existing.additional_info || '');

  const toggleEnv = (key) => {
    setEnvironment((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const onNext = () => {
    updateFormData({
      insights: {
        ...existing,
        hours_per_week: hoursPerWeek,
        cadence,
        x_per_week: cadence === 'x_per_week' ? Math.round(xPerWeek) : undefined,
        environment,
        environment_other: environment.includes('other') ? envOther.trim() : undefined,
        additional_info: additionalInfo.trim(),
      },
    });
    goNextPage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Insights (2/2)</Text>
      <Text style={styles.subtitle}>Define your availability & environment.</Text>

      {/* Hours per week */}
      <Section title={`Available time: ${hoursPerWeek.toFixed(1)} h / week`}>
        <Slider
          minimumValue={0.5}
          maximumValue={30}
          step={0.5}
          value={hoursPerWeek}
          onValueChange={setHoursPerWeek}
          minimumTrackTintColor="#2563EB"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#2563EB"
        />
      </Section>

      {/* Cadence */}
      <Section title="Preferred cadence">
        <View style={styles.rowWrap}>
          {['daily', 'weekly', 'biweekly', 'x_per_week'].map((k) => (
            <Chip
              key={k}
              label={
                k === 'x_per_week'
                  ? 'How many times / week'
                  : k.charAt(0).toUpperCase() + k.slice(1)
              }
              selected={cadence === k}
              onPress={() => setCadence(k)}
            />
          ))}
        </View>

        {/* Slider for How many times per week */}
        {cadence === 'x_per_week' && (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ fontWeight: '600', color: '#111827', marginBottom: 4 }}>
              {`${Math.round(xPerWeek)} times / week`}
            </Text>
            <Slider
              style={{ width: '100%' }}
              minimumValue={1}
              maximumValue={7}
              step={1}
              value={xPerWeek}
              onValueChange={setXPerWeek}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#2563EB"
            />
          </View>
        )}
      </Section>

      {/* Environment */}
      <Section title="Environment (multi-select)">
        <View style={styles.rowWrap}>
          {envOptions.map((o) => (
            <MultiChip
              key={o.key}
              label={o.label}
              selected={environment.includes(o.key)}
              onPress={() => toggleEnv(o.key)}
            />
          ))}
        </View>

        {environment.includes('other') && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Describe your environment</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cafés with outlets"
              placeholderTextColor="#9CA3AF"
              value={envOther}
              onChangeText={setEnvOther}
            />
          </View>
        )}
      </Section>

      {/* Additional Information */}
      <Section
        title="Additional information (optional)"
        subtitle="Anything else that would help us plan?"
      >
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="Constraints, schedules, tools you prefer..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
        />
      </Section>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
          <Text style={styles.navBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={onNext}>
          <Text style={[styles.navBtnText, { color: '#fff' }]}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#F9FAFB' },
  title: { fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 6, color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 12 },
  section: { marginTop: 10, marginBottom: 6 },
  sectionTitle: { fontWeight: '700', color: '#111827', fontSize: 15 },
  sectionSub: { color: '#6B7280', marginTop: 2 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#2563EB15', borderColor: '#2563EB' },
  chipText: { color: '#111827', fontWeight: '600', fontSize: 13 },
  chipTextSelected: { color: '#1D4ED8' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  label: { fontWeight: '600', color: '#374151', marginBottom: 6 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});