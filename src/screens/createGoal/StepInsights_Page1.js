// screens/createGoal/StepInsights_Page1.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';

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

/* ---------- 選項定義（精簡版文字） ---------- */
const INTENT_BY_CAT = {
  'Academic and Education': [
    { key: 'pass_exam', label: 'Exam' },
    { key: 'thesis', label: 'Thesis' },
    { key: 'course', label: 'Course' },
    { key: 'research', label: 'Research' },
    { key: 'other', label: 'Other' },
  ],
  'Career and Professional': [
    { key: 'internship', label: 'Internship' },
    { key: 'job', label: 'Job offer' },
    { key: 'switch', label: 'Career switch' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'other', label: 'Other' },
  ],
  'Personal and Lifestyle': [
    { key: 'fitness', label: 'Fitness' },
    { key: 'finance', label: 'Finance' },
    { key: 'travel', label: 'Travel' },
    { key: 'wellbeing', label: 'Wellbeing' },
    { key: 'other', label: 'Other' },
  ],
  'Habits and Learning': [
    { key: 'habit', label: 'Habit' },
    { key: 'skill', label: 'Skill' },
    { key: 'output', label: 'Output' },
    { key: 'other', label: 'Other' },
  ],
};

const OUTCOME_BY_CAT = {
  'Academic and Education': [
    { key: 'exam_score', label: 'Exam score or grade' },
    { key: 'thesis_defense', label: 'Thesis / Project defense' },
    { key: 'course_completion', label: 'Course / Module completed' },
    { key: 'certification', label: 'Official certification' },
    { key: 'publication', label: 'Paper / Presentation published' },
    { key: 'other', label: 'Other' },
  ],
  'Career and Professional': [
    { key: 'offer_received', label: 'Offer received' },
    { key: 'successful_interviews', label: 'Interviews completed' },
    { key: 'portfolio_published', label: 'Portfolio or case done' },
    { key: 'project_delivered', label: 'Project delivered' },
    { key: 'network_expanded', label: 'Network or mentor gained' },
    { key: 'other', label: 'Other' },
  ],
  'Personal and Lifestyle': [
    { key: 'habit_streak', label: 'Habit streak maintained' },
    { key: 'milestone_reached', label: 'Milestone achieved' },
    { key: 'goal_event', label: 'Event completed (e.g., race, trip)' },
    { key: 'progress_target', label: 'Progress target met (e.g., 5kg lost)' },
    { key: 'routine_stabilized', label: 'Routine stabilized' },
    { key: 'other', label: 'Other' },
  ],
  'Habits and Learning': [
    { key: 'streak_days', label: 'Consecutive streak days' },
    { key: 'module_done', label: 'Module / Chapter completed' },
    { key: 'skill_level', label: 'Skill level improved' },
    { key: 'content_published', label: 'Created / Published content' },
    { key: 'certificate', label: 'Certificate / Badge earned' },
    { key: 'other', label: 'Other' },
  ],
};

const CONSTRAINTS = [
  { key: 'time', label: 'Time' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'budget', label: 'Budget' },
  { key: 'resources', label: 'Resources' },
  { key: 'health', label: 'Health' },
  { key: 'unclear', label: 'Unclear plan' },
  { key: 'other', label: 'Other' },
];

export default function StepInsights_Page1({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;
  const existing = formData.insights || {};

  const [intent, setIntent] = useState(existing.intent || null);
  const [intentOther, setIntentOther] = useState(existing.intent_other || '');
  const [outcome, setOutcome] = useState(existing.outcome_style || null);
  const [outcomeOther, setOutcomeOther] = useState(existing.outcome_other || '');

  const [constraints, setConstraints] = useState(existing.constraints || []);
  const [constraintOther, setConstraintOther] = useState(existing.constraint_other || '');
  const [needZeroCost, setNeedZeroCost] = useState(
    typeof existing.need_zero_cost === 'boolean' ? existing.need_zero_cost : false
  );

  const intentOptions = useMemo(() => INTENT_BY_CAT[cat] || [], [cat]);
  const outcomeOptions = useMemo(() => OUTCOME_BY_CAT[cat] || [], [cat]);

  const toggleConstraint = (key) => {
    setConstraints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const onNext = () => {
    Keyboard.dismiss();
    updateFormData({
      insights: {
        ...existing,
        intent,
        intent_other: intent === 'other' ? intentOther.trim() : undefined,
        outcome_style: outcome,
        outcome_other: outcome === 'other' ? outcomeOther.trim() : undefined,
        constraints,
        constraint_other: constraints.includes('other') ? constraintOther.trim() : undefined,
        need_zero_cost: constraints.includes('budget') ? !!needZeroCost : undefined,
      },
    });
    goNextPage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Insights (1/2)</Text>

      <Section title="Primary intent">
        <View style={styles.rowWrap}>
          {intentOptions.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              selected={intent === o.key}
              onPress={() => setIntent(o.key)}
            />
          ))}
        </View>
        {intent === 'other' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Other intent..."
            placeholderTextColor="#9CA3AF"
            value={intentOther}
            onChangeText={setIntentOther}
          />
        )}
      </Section>

      <Section title="Outcome style">
        <View style={styles.rowWrap}>
          {outcomeOptions.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              selected={outcome === o.key}
              onPress={() => setOutcome(o.key)}
            />
          ))}
        </View>
        {outcome === 'other' && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Other outcome..."
            placeholderTextColor="#9CA3AF"
            value={outcomeOther}
            onChangeText={setOutcomeOther}
          />
        )}
      </Section>

      <Section title="Constraints (multi-select)">
        <View style={styles.rowWrap}>
          {CONSTRAINTS.map((o) => (
            <MultiChip
              key={o.key}
              label={o.label}
              selected={constraints.includes(o.key)}
              onPress={() => toggleConstraint(o.key)}
            />
          ))}
        </View>

        {constraints.includes('budget') && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.inline}>
              <Text style={styles.inlineLabel}>Prefer zero-cost resources</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setNeedZeroCost((v) => !v)}
                style={[styles.toggle, needZeroCost && styles.toggleOn]}
              >
                <View style={[styles.knob, needZeroCost && styles.knobOn]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {constraints.includes('other') && (
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Describe other constraint..."
            placeholderTextColor="#9CA3AF"
            value={constraintOther}
            onChangeText={setConstraintOther}
          />
        )}
      </Section>

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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#F9FAFB' },
  title: { fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 10, color: '#111827' },
  section: { marginTop: 8, marginBottom: 6 },
  sectionTitle: { fontWeight: '700', color: '#111827', fontSize: 15 },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
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
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineLabel: { fontWeight: '600', color: '#111827', fontSize: 13 },
  toggle: {
    width: 48, height: 26, borderRadius: 16, backgroundColor: '#E5E7EB',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  toggleOn: { backgroundColor: '#2563EB' },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navBtn: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});