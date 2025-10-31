// screens/createGoal/StepDetails_Page1.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

/** 小元件：單選 Chip */
function Chip({ label, value, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** 小元件：多選 Chip */
function MultiChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** 小元件：區塊 */
function Section({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

const INTENT_OPTIONS = [
  { key: 'improve_skill', label: 'Improve skill' },
  { key: 'pass_exam', label: 'Pass exam' },
  { key: 'get_offer', label: 'Get offer' },
  { key: 'finish_project', label: 'Finish project' },
  { key: 'health_fitness', label: 'Health & fitness' },
  { key: 'save_money', label: 'Save money' },
  { key: 'other', label: 'Other' },
];

const OUTCOME_STYLE = [
  { key: 'certification', label: 'Certification' },
  { key: 'scored_exam', label: 'Scored exam' },
  { key: 'shipped_product', label: 'Shipped product' },
  { key: 'published_content', label: 'Published content' },
  { key: 'habit_streak', label: 'Habit streak' },
  { key: 'financial_milestone', label: 'Financial milestone' },
];

const CONSTRAINTS = [
  { key: 'time', label: 'Limited time' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'budget', label: 'Budget' },
  { key: 'resources', label: 'Resources' },
  { key: 'health', label: 'Health' },
  { key: 'unclear_strategy', label: 'Unclear strategy' },
];

const CADENCE = [
  { key: 'daily', label: 'Daily' },
  { key: '3x_week', label: '3× / week' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'biweekly', label: 'Biweekly' },
];

const COACH_STYLE = [
  { key: 'supportive', label: 'Supportive' },
  { key: 'efficient', label: 'Efficient' },
  { key: 'analytical', label: 'Analytical' },
  { key: 'accountability', label: 'Accountability' },
];

const ENV_OPTIONS = [
  { key: 'home_only', label: 'Home only' },
  { key: 'library', label: 'Library' },
  { key: 'gym', label: 'Gym' },
  { key: 'pc_required', label: 'PC required' },
  { key: 'mobile_only', label: 'Mobile only' },
  { key: 'offline_ok', label: 'Offline ok' },
];

const MAX_NOTE = 100;

export default function StepDetails_Page1({ formData, updateFormData, goPrevPage, goNextPage }) {
  const existing = formData.insights || {};

  // ----- 本地 state（避免受控/非受控來回跳）-----
  const [intent, setIntent] = useState(existing.intent || 'improve_skill');
  const [outcomeStyle, setOutcomeStyle] = useState(
    existing.outcome_style ||
      (formData.category === 'Academic and Education' ? 'scored_exam' : 'habit_streak')
  );
  const [constraints, setConstraints] = useState(existing.constraints || []);
  const [hoursPerWeek, setHoursPerWeek] = useState(
    typeof existing.hours_per_week === 'number' ? existing.hours_per_week : 4
  );
  const [cadence, setCadence] = useState(existing.cadence || 'weekly');
  const [coachStyle, setCoachStyle] = useState(existing.coach_style || 'efficient');
  const [environment, setEnvironment] = useState(existing.environment || []);
  const [confidence, setConfidence] = useState(
    typeof existing.confidence === 'number' ? existing.confidence : 6
  );
  const [needZeroCost, setNeedZeroCost] = useState(
    typeof existing.need_zero_cost === 'boolean' ? existing.need_zero_cost : true
  );
  const [tinyNote, setTinyNote] = useState(existing.tiny_note || '');

  // 聯動：若選 Pass exam，自動把 outcome 調為 scored_exam（可被覆寫）
  const outcomeStyleAuto = useMemo(() => {
    if (intent === 'pass_exam' && outcomeStyle !== 'scored_exam') {
      return 'scored_exam';
    }
    return outcomeStyle;
  }, [intent, outcomeStyle]);

  // 單/多選邏輯
  const toggleConstraint = (key) => {
    setConstraints((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((k) => k !== key);
      if (prev.length >= 2) return [...prev.slice(1), key]; // 最多 2 個
      return [...prev, key];
    });
  };

  const toggleEnvironment = (key) => {
    setEnvironment((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const onNext = async () => {
    Keyboard.dismiss();
    // 儲存 insights
    updateFormData({
      insights: {
        intent,
        outcome_style: outcomeStyleAuto,
        constraints,
        hours_per_week: hoursPerWeek,
        cadence,
        coach_style: coachStyle,
        environment,
        confidence,
        need_zero_cost: constraints.includes('budget') ? needZeroCost : undefined,
        tiny_note: tinyNote,
      },
    });
    await delay(250);
    goNextPage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Insights</Text>
      <Text style={styles.subtitle}>Answer with taps and sliders — keep typing minimal.</Text>

      {/* Intent */}
      <Section title="Primary intent" subtitle="What’s the main purpose of this goal?">
        <View style={styles.rowWrap}>
          {INTENT_OPTIONS.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              value={o.key}
              selected={intent === o.key}
              onPress={() => setIntent(o.key)}
            />
          ))}
        </View>
      </Section>

      {/* Outcome */}
      <Section title="Outcome style" subtitle="How should success look like?">
        <View style={styles.rowWrap}>
          {OUTCOME_STYLE.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              value={o.key}
              selected={outcomeStyleAuto === o.key}
              onPress={() => setOutcomeStyle(o.key)}
            />
          ))}
        </View>
      </Section>

      {/* Constraints */}
      <Section title="Main constraints (up to 2)">
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

        {/* 只有勾 budget 時出現 */}
        {constraints.includes('budget') && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.inline}>
              <Text style={styles.inlineLabel}>Zero-cost plan preferred</Text>
              <TouchableOpacity
                onPress={() => setNeedZeroCost((v) => !v)}
                style={[styles.toggle, needZeroCost && styles.toggleOn]}
                activeOpacity={0.8}
              >
                <View style={[styles.knob, needZeroCost && styles.knobOn]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>If on, AI will avoid paid resources.</Text>
          </View>
        )}
      </Section>

      {/* Hours per week */}
      <Section title={`Available time per week: ${hoursPerWeek.toFixed(1)}h`}>
        <Slider
          minimumValue={0.5}
          maximumValue={20}
          step={0.5}
          value={hoursPerWeek}
          onValueChange={setHoursPerWeek}
        />
        <Text style={styles.hint}>AI scales the number of tasks per week accordingly.</Text>
      </Section>

      {/* Cadence */}
      <Section title="Preferred cadence">
        <View style={styles.rowWrap}>
          {CADENCE.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              selected={cadence === o.key}
              onPress={() => setCadence(o.key)}
            />
          ))}
        </View>
      </Section>

      {/* Coach style */}
      <Section title="Support style">
        <View style={styles.rowWrap}>
          {COACH_STYLE.map((o) => (
            <Chip
              key={o.key}
              label={o.label}
              selected={coachStyle === o.key}
              onPress={() => setCoachStyle(o.key)}
            />
          ))}
        </View>
      </Section>

      {/* Environment */}
      <Section title="Environment">
        <View style={styles.rowWrap}>
          {ENV_OPTIONS.map((o) => (
            <MultiChip
              key={o.key}
              label={o.label}
              selected={environment.includes(o.key)}
              onPress={() => toggleEnvironment(o.key)}
            />
          ))}
        </View>
      </Section>

      {/* Confidence */}
      <Section title={`Confidence: ${confidence}/10`} subtitle="Used to tune task difficulty & micro-wins.">
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={confidence}
          onValueChange={setConfidence}
        />
      </Section>

      {/* Tiny Note */}
      <Section title="Tiny note (optional)" subtitle="≤ 100 chars">
        <TextInput
          style={styles.input}
          placeholder="Any nuance I should know?"
          placeholderTextColor="#9CA3AF"
          value={tinyNote}
          onChangeText={(t) => setTinyNote((t || '').slice(0, MAX_NOTE))}
        />
        <Text style={styles.counter}>{(tinyNote || '').length} / {MAX_NOTE}</Text>
      </Section>

      {/* Nav */}
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

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 6, color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 12 },
  section: { marginTop: 10, marginBottom: 6 },
  sectionTitle: { fontWeight: '700', color: '#111827' },
  sectionSub: { color: '#6B7280', marginTop: 2 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#2563EB15', borderColor: '#2563EB' },
  chipText: { color: '#111827', fontWeight: '600' },
  chipTextSelected: { color: '#1D4ED8' },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineLabel: { fontWeight: '600', color: '#111827' },
  hint: { color: '#6B7280', marginTop: 6 },
  toggle: {
    width: 48, height: 28, borderRadius: 16, backgroundColor: '#E5E7EB',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  toggleOn: { backgroundColor: '#2563EB' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, backgroundColor: '#fff',
  },
  counter: { textAlign: 'right', color: '#6B7280', marginTop: 4 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navBtn: {
    paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10,
    borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});