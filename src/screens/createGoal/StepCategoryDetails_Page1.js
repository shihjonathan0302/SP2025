// screens/createGoal/StepCategoryDetails_Page1.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

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

export default function StepCategoryDetails_Page1({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;

  const insights = formData.insights || {};
  const defaultHours = typeof insights.hours_per_week === 'number' ? insights.hours_per_week : 4;

  /* ---------- 各類別專屬狀態 ---------- */

  // Academic
  const [studyMode, setStudyMode] = useState('self'); // self | group | tutor
  const [studyFocus, setStudyFocus] = useState([]); // grammar, mock, speaking, etc
  const [materialSource, setMaterialSource] = useState([]); // official, yt, course, ai
  const [examStyle, setExamStyle] = useState('structured'); // structured | flexible

  // Career
  const [goalPath, setGoalPath] = useState('internship'); // internship | job | switch | startup
  const [jobFocus, setJobFocus] = useState([]); // resume, portfolio, networking, etc
  const [collabStyle, setCollabStyle] = useState('solo'); // solo | mentor | team
  const [region, setRegion] = useState('TW'); // TW | EU | NA | Remote

  // Personal
  const [goalType, setGoalType] = useState('fitness'); // fitness | finance | travel | habit
  const [tracking, setTracking] = useState('weekly'); // daily | weekly | monthly
  const [supportLevel, setSupportLevel] = useState(5); // 1–10 support needed
  const [motivationType, setMotivationType] = useState('visual'); // visual | reward | reflection

  // Habits
  const [habitType, setHabitType] = useState('reading'); // reading | coding | language | instrument
  const [habitDuration, setHabitDuration] = useState(30); // minutes per session
  const [method, setMethod] = useState([]); // app | book | tutor | community
  const [streakGoal, setStreakGoal] = useState(14); // days

  /* ---------- 預填 ---------- */
  useEffect(() => {
    const saved = formData.categoryDetails || {};
    if (!saved.__filled) return;
    if (cat === 'Academic and Education') {
      setStudyMode(saved.study_mode || 'self');
      setStudyFocus(saved.study_focus || []);
      setMaterialSource(saved.material_source || []);
      setExamStyle(saved.exam_style || 'structured');
    } else if (cat === 'Career and Professional') {
      setGoalPath(saved.goal_path || 'internship');
      setJobFocus(saved.job_focus || []);
      setCollabStyle(saved.collab_style || 'solo');
      setRegion(saved.region || 'TW');
    } else if (cat === 'Personal and Lifestyle') {
      setGoalType(saved.goal_type || 'fitness');
      setTracking(saved.tracking || 'weekly');
      setSupportLevel(typeof saved.support_level === 'number' ? saved.support_level : 5);
      setMotivationType(saved.motivation_type || 'visual');
    } else if (cat === 'Habits and Learning') {
      setHabitType(saved.habit_type || 'reading');
      setHabitDuration(typeof saved.habit_duration === 'number' ? saved.habit_duration : 30);
      setMethod(saved.method || []);
      setStreakGoal(typeof saved.streak_goal === 'number' ? saved.streak_goal : 14);
    }
  }, []);

  const toggle = (arr, setter, key) =>
    setter(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  /* ---------- 儲存 ---------- */
  const onNext = () => {
    let payload = { __filled: true };

    if (cat === 'Academic and Education') {
      payload = {
        ...payload,
        study_mode: studyMode,
        study_focus: studyFocus,
        material_source: materialSource,
        exam_style: examStyle,
      };
    } else if (cat === 'Career and Professional') {
      payload = {
        ...payload,
        goal_path: goalPath,
        job_focus: jobFocus,
        collab_style: collabStyle,
        region,
      };
    } else if (cat === 'Personal and Lifestyle') {
      payload = {
        ...payload,
        goal_type: goalType,
        tracking,
        support_level: supportLevel,
        motivation_type: motivationType,
      };
    } else if (cat === 'Habits and Learning') {
      payload = {
        ...payload,
        habit_type: habitType,
        habit_duration: habitDuration,
        method,
        streak_goal: streakGoal,
      };
    }

    updateFormData({ categoryDetails: payload });
    goNextPage();
  };

  /* ---------- 各類別畫面 ---------- */

  const renderAcademic = () => (
    <>
      <Section title="Study mode">
        <View style={styles.rowWrap}>
          {['self', 'group', 'tutor'].map((k) => (
            <Chip key={k} label={k} selected={studyMode === k} onPress={() => setStudyMode(k)} />
          ))}
        </View>
      </Section>

      <Section title="Focus areas">
        <View style={styles.rowWrap}>
          {['grammar', 'mock', 'listening', 'writing', 'speaking'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={studyFocus.includes(k)}
              onPress={() => toggle(studyFocus, setStudyFocus, k)}
            />
          ))}
        </View>
      </Section>

      <Section title="Materials">
        <View style={styles.rowWrap}>
          {['official', 'online', 'youtube', 'ai_tool', 'book'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={materialSource.includes(k)}
              onPress={() => toggle(materialSource, setMaterialSource, k)}
            />
          ))}
        </View>
      </Section>

      <Section title="Study style">
        <View style={styles.rowWrap}>
          {['structured', 'flexible'].map((k) => (
            <Chip key={k} label={k} selected={examStyle === k} onPress={() => setExamStyle(k)} />
          ))}
        </View>
      </Section>
    </>
  );

  const renderCareer = () => (
    <>
      <Section title="Goal path">
        <View style={styles.rowWrap}>
          {['internship', 'job', 'switch', 'startup'].map((k) => (
            <Chip key={k} label={k} selected={goalPath === k} onPress={() => setGoalPath(k)} />
          ))}
        </View>
      </Section>

      <Section title="Key focuses">
        <View style={styles.rowWrap}>
          {['resume', 'portfolio', 'networking', 'interview', 'project'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={jobFocus.includes(k)}
              onPress={() => toggle(jobFocus, setJobFocus, k)}
            />
          ))}
        </View>
      </Section>

      <Section title="Collaboration style">
        <View style={styles.rowWrap}>
          {['solo', 'mentor', 'team'].map((k) => (
            <Chip key={k} label={k} selected={collabStyle === k} onPress={() => setCollabStyle(k)} />
          ))}
        </View>
      </Section>

      <Section title="Region">
        <View style={styles.rowWrap}>
          {['TW', 'EU', 'NA', 'Remote'].map((k) => (
            <Chip key={k} label={k} selected={region === k} onPress={() => setRegion(k)} />
          ))}
        </View>
      </Section>
    </>
  );

  const renderPersonal = () => (
    <>
      <Section title="Goal type">
        <View style={styles.rowWrap}>
          {['fitness', 'finance', 'travel', 'habit', 'mindfulness'].map((k) => (
            <Chip key={k} label={k} selected={goalType === k} onPress={() => setGoalType(k)} />
          ))}
        </View>
      </Section>

      <Section title="Tracking frequency">
        <View style={styles.rowWrap}>
          {['daily', 'weekly', 'monthly'].map((k) => (
            <Chip key={k} label={k} selected={tracking === k} onPress={() => setTracking(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Support need: ${supportLevel}/10`}>
        <Slider minimumValue={1} maximumValue={10} step={1} value={supportLevel} onValueChange={setSupportLevel} />
      </Section>

      <Section title="Motivation style">
        <View style={styles.rowWrap}>
          {['visual', 'reward', 'reflection'].map((k) => (
            <Chip
              key={k}
              label={k}
              selected={motivationType === k}
              onPress={() => setMotivationType(k)}
            />
          ))}
        </View>
      </Section>
    </>
  );

  const renderHabit = () => (
    <>
      <Section title="Habit type">
        <View style={styles.rowWrap}>
          {['reading', 'coding', 'language', 'instrument', 'meditation'].map((k) => (
            <Chip key={k} label={k} selected={habitType === k} onPress={() => setHabitType(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Session duration: ${habitDuration} min`}>
        <Slider
          minimumValue={10}
          maximumValue={120}
          step={5}
          value={habitDuration}
          onValueChange={setHabitDuration}
        />
      </Section>

      <Section title="Learning method">
        <View style={styles.rowWrap}>
          {['app', 'book', 'tutor', 'community', 'online_course'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={method.includes(k)}
              onPress={() => toggle(method, setMethod, k)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Streak goal: ${streakGoal} days`}>
        <Slider minimumValue={7} maximumValue={60} step={1} value={streakGoal} onValueChange={setStreakGoal} />
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
        return (
          <Text style={{ textAlign: 'center', color: '#6B7280', marginVertical: 20 }}>
            No specific questions.
          </Text>
        );
    }
  }, [cat, studyMode, studyFocus, materialSource, examStyle, goalPath, jobFocus, collabStyle, region,
      goalType, tracking, supportLevel, motivationType, habitType, habitDuration, method, streakGoal]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Details</Text>
      <Text style={styles.subtitle}>Help us tailor concrete actions for your goal.</Text>

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
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10, backgroundColor: '#fff', fontSize: 14,
  },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navBtn: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});