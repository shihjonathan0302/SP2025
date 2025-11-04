// screens/createGoal/StepCategoryDetails_Page2.js
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

/* ---------- 基本元件 ---------- */
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

export default function StepCategoryDetails_Page2({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;
  const prevDetails = formData.categoryDetails || {};

  /* ---------- Academic ---------- */
  const [examFormat, setExamFormat] = useState('written'); // written | oral | project
  const [progressCheck, setProgressCheck] = useState('weekly'); // daily | weekly | monthly
  const [mockTests, setMockTests] = useState(2); // number per month
  const [milestoneVisibility, setMilestoneVisibility] = useState('auto'); // auto | manual

  /* ---------- Career ---------- */
  const [deliverableType, setDeliverableType] = useState('portfolio'); // portfolio | report | presentation | project
  const [networkIntensity, setNetworkIntensity] = useState(3); // meetings per month
  const [feedbackSource, setFeedbackSource] = useState([]); // mentor | peer | hr | recruiter
  const [successMeasure, setSuccessMeasure] = useState('offer'); // offer | referrals | skill_gain

  /* ---------- Personal ---------- */
  const [goalNature, setGoalNature] = useState('result'); // result | process
  const [progressMetric, setProgressMetric] = useState('percentage'); // percentage | milestone | checkin
  const [checkpointInterval, setCheckpointInterval] = useState('weekly'); // daily | weekly | monthly
  const [reflection, setReflection] = useState(false); // boolean

  /* ---------- Habits ---------- */
  const [streakReminder, setStreakReminder] = useState(true); // reminder on/off
  const [habitEvaluation, setHabitEvaluation] = useState('self'); // self | ai | mixed
  const [breakTolerance, setBreakTolerance] = useState(2); // days allowed
  const [reviewCycle, setReviewCycle] = useState('weekly'); // weekly | biweekly | monthly

  /* ---------- 預填 ---------- */
  useEffect(() => {
    if (!prevDetails.__filled) return;
    if (cat === 'Academic and Education') {
      setExamFormat(prevDetails.exam_format || 'written');
      setProgressCheck(prevDetails.progress_check || 'weekly');
      setMockTests(typeof prevDetails.mock_tests === 'number' ? prevDetails.mock_tests : 2);
      setMilestoneVisibility(prevDetails.milestone_visibility || 'auto');
    } else if (cat === 'Career and Professional') {
      setDeliverableType(prevDetails.deliverable_type || 'portfolio');
      setNetworkIntensity(typeof prevDetails.network_intensity === 'number' ? prevDetails.network_intensity : 3);
      setFeedbackSource(prevDetails.feedback_source || []);
      setSuccessMeasure(prevDetails.success_measure || 'offer');
    } else if (cat === 'Personal and Lifestyle') {
      setGoalNature(prevDetails.goal_nature || 'result');
      setProgressMetric(prevDetails.progress_metric || 'percentage');
      setCheckpointInterval(prevDetails.checkpoint_interval || 'weekly');
      setReflection(!!prevDetails.reflection);
    } else if (cat === 'Habits and Learning') {
      setStreakReminder(!!prevDetails.streak_reminder);
      setHabitEvaluation(prevDetails.habit_evaluation || 'self');
      setBreakTolerance(typeof prevDetails.break_tolerance === 'number' ? prevDetails.break_tolerance : 2);
      setReviewCycle(prevDetails.review_cycle || 'weekly');
    }
  }, []);

  const toggle = (arr, setter, key) =>
    setter(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  /* ---------- 儲存 ---------- */
  const onNext = () => {
    const payload = { __filled: true, ...prevDetails };

    if (cat === 'Academic and Education') {
      Object.assign(payload, {
        exam_format: examFormat,
        progress_check: progressCheck,
        mock_tests: mockTests,
        milestone_visibility: milestoneVisibility,
      });
    } else if (cat === 'Career and Professional') {
      Object.assign(payload, {
        deliverable_type: deliverableType,
        network_intensity: networkIntensity,
        feedback_source: feedbackSource,
        success_measure: successMeasure,
      });
    } else if (cat === 'Personal and Lifestyle') {
      Object.assign(payload, {
        goal_nature: goalNature,
        progress_metric: progressMetric,
        checkpoint_interval: checkpointInterval,
        reflection,
      });
    } else if (cat === 'Habits and Learning') {
      Object.assign(payload, {
        streak_reminder: streakReminder,
        habit_evaluation: habitEvaluation,
        break_tolerance: breakTolerance,
        review_cycle: reviewCycle,
      });
    }

    updateFormData({ categoryDetails: payload });
    goNextPage();
  };

  /* ---------- 各類別渲染 ---------- */

  const renderAcademic = () => (
    <>
      <Section title="Exam format">
        <View style={styles.rowWrap}>
          {['written', 'oral', 'project'].map((k) => (
            <Chip key={k} label={k} selected={examFormat === k} onPress={() => setExamFormat(k)} />
          ))}
        </View>
      </Section>

      <Section title="Progress check">
        <View style={styles.rowWrap}>
          {['daily', 'weekly', 'monthly'].map((k) => (
            <Chip key={k} label={k} selected={progressCheck === k} onPress={() => setProgressCheck(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Mock tests per month: ${mockTests}`}>
        <Slider minimumValue={0} maximumValue={8} step={1} value={mockTests} onValueChange={setMockTests} />
      </Section>

      <Section title="Milestone visibility">
        <View style={styles.rowWrap}>
          {['auto', 'manual'].map((k) => (
            <Chip key={k} label={k} selected={milestoneVisibility === k} onPress={() => setMilestoneVisibility(k)} />
          ))}
        </View>
      </Section>
    </>
  );

  const renderCareer = () => (
    <>
      <Section title="Deliverable type">
        <View style={styles.rowWrap}>
          {['portfolio', 'report', 'presentation', 'project'].map((k) => (
            <Chip key={k} label={k} selected={deliverableType === k} onPress={() => setDeliverableType(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Networking intensity: ${networkIntensity} meetings / month`}>
        <Slider minimumValue={0} maximumValue={10} step={1} value={networkIntensity} onValueChange={setNetworkIntensity} />
      </Section>

      <Section title="Feedback sources (multi)">
        <View style={styles.rowWrap}>
          {['mentor', 'peer', 'hr', 'recruiter'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={feedbackSource.includes(k)}
              onPress={() => toggle(feedbackSource, setFeedbackSource, k)}
            />
          ))}
        </View>
      </Section>

      <Section title="Measure of success">
        <View style={styles.rowWrap}>
          {['offer', 'referrals', 'skill_gain'].map((k) => (
            <Chip key={k} label={k.replace('_', ' ')} selected={successMeasure === k} onPress={() => setSuccessMeasure(k)} />
          ))}
        </View>
      </Section>
    </>
  );

  const renderPersonal = () => (
    <>
      <Section title="Goal nature">
        <View style={styles.rowWrap}>
          {['result', 'process'].map((k) => (
            <Chip key={k} label={k} selected={goalNature === k} onPress={() => setGoalNature(k)} />
          ))}
        </View>
      </Section>

      <Section title="Progress metric">
        <View style={styles.rowWrap}>
          {['percentage', 'milestone', 'checkin'].map((k) => (
            <Chip key={k} label={k} selected={progressMetric === k} onPress={() => setProgressMetric(k)} />
          ))}
        </View>
      </Section>

      <Section title="Checkpoint interval">
        <View style={styles.rowWrap}>
          {['daily', 'weekly', 'monthly'].map((k) => (
            <Chip key={k} label={k} selected={checkpointInterval === k} onPress={() => setCheckpointInterval(k)} />
          ))}
        </View>
      </Section>

      <Section title="Reflection enabled?">
        <TouchableOpacity
          onPress={() => setReflection((v) => !v)}
          activeOpacity={0.85}
          style={[styles.toggle, reflection && styles.toggleOn]}
        >
          <View style={[styles.knob, reflection && styles.knobOn]} />
        </TouchableOpacity>
      </Section>
    </>
  );

  const renderHabit = () => (
    <>
      <Section title="Enable streak reminders">
        <TouchableOpacity
          onPress={() => setStreakReminder((v) => !v)}
          activeOpacity={0.85}
          style={[styles.toggle, streakReminder && styles.toggleOn]}
        >
          <View style={[styles.knob, streakReminder && styles.knobOn]} />
        </TouchableOpacity>
      </Section>

      <Section title="Evaluation method">
        <View style={styles.rowWrap}>
          {['self', 'ai', 'mixed'].map((k) => (
            <Chip key={k} label={k} selected={habitEvaluation === k} onPress={() => setHabitEvaluation(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Allowed break days: ${breakTolerance}`}>
        <Slider minimumValue={0} maximumValue={7} step={1} value={breakTolerance} onValueChange={setBreakTolerance} />
      </Section>

      <Section title="Review cycle">
        <View style={styles.rowWrap}>
          {['weekly', 'biweekly', 'monthly'].map((k) => (
            <Chip key={k} label={k} selected={reviewCycle === k} onPress={() => setReviewCycle(k)} />
          ))}
        </View>
      </Section>
    </>
  );

  const content = useMemo(() => {
    switch (cat) {
      case 'Academic and Education':
        return renderAcademic();
      case 'Career and Professional':
        return renderCareer();
      case 'Personal and Lifestyle':
        return renderPersonal();
      case 'Habits and Learning':
        return renderHabit();
      default:
        return <Text style={{ textAlign: 'center', color: '#6B7280' }}>No follow-up questions.</Text>;
    }
  }, [cat, examFormat, progressCheck, mockTests, milestoneVisibility, deliverableType, networkIntensity, feedbackSource, successMeasure, goalNature, progressMetric, checkpointInterval, reflection, streakReminder, habitEvaluation, breakTolerance, reviewCycle]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Details – Progress</Text>
      <Text style={styles.subtitle}>Define how you want to track and measure progress.</Text>

      {content}

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
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 10 },
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
  toggle: {
    width: 48, height: 28, borderRadius: 16, backgroundColor: '#E5E7EB',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  toggleOn: { backgroundColor: '#2563EB' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  navBtn: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});