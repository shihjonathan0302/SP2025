// screens/createGoal/StepCategoryDetails_Page1.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

/* ---------- 通用元件 ---------- */
function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MultiChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

/* ---------- 主頁面 ---------- */
export default function StepCategoryDetails_Page1({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;
  const prevDetails = formData.categoryDetails || {};

  /* ---------- 各類別狀態 ---------- */
  // Academic
  const [learningStyle, setLearningStyle] = useState('solo');
  const [studyFocus, setStudyFocus] = useState([]);

  // Career
  const [careerType, setCareerType] = useState('internship');
  const [careerFocus, setCareerFocus] = useState([]);
  const [region, setRegion] = useState('TW');

  // Personal
  const [theme, setTheme] = useState('fitness');
  const [routine, setRoutine] = useState('weekly');
  const [supportLevel, setSupportLevel] = useState(5);

  // Habits
  const [habitType, setHabitType] = useState('reading');
  const [learningTools, setLearningTools] = useState([]);
  const [sessionDuration, setSessionDuration] = useState(30);

  /* ---------- 預填 ---------- */
  useEffect(() => {
    if (!prevDetails.__filled) return;
    if (cat === 'Academic and Education') {
      setLearningStyle(prevDetails.learning_style || 'solo');
      setStudyFocus(prevDetails.study_focus || []);
    } else if (cat === 'Career and Professional') {
      setCareerType(prevDetails.career_type || 'internship');
      setCareerFocus(prevDetails.career_focus || []);
      setRegion(prevDetails.region || 'TW');
    } else if (cat === 'Personal and Lifestyle') {
      setTheme(prevDetails.theme || 'fitness');
      setRoutine(prevDetails.routine || 'weekly');
      setSupportLevel(prevDetails.support_level || 5);
    } else if (cat === 'Habits and Learning') {
      setHabitType(prevDetails.habit_type || 'reading');
      setLearningTools(prevDetails.learning_tools || []);
      setSessionDuration(prevDetails.session_duration || 30);
    }
  }, []);

  const toggle = (arr, setter, key) =>
    setter(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  const onNext = () => {
    let payload = { __filled: true };

    if (cat === 'Academic and Education') {
      payload = {
        ...payload,
        learning_style: learningStyle,
        study_focus: studyFocus,
      };
    } else if (cat === 'Career and Professional') {
      payload = {
        ...payload,
        career_type: careerType,
        career_focus: careerFocus,
        region,
      };
    } else if (cat === 'Personal and Lifestyle') {
      payload = {
        ...payload,
        theme,
        routine,
        support_level: supportLevel,
      };
    } else if (cat === 'Habits and Learning') {
      payload = {
        ...payload,
        habit_type: habitType,
        learning_tools: learningTools,
        session_duration: sessionDuration,
      };
    }

    updateFormData({ categoryDetails: payload });
    goNextPage();
  };

  /* ---------- 畫面渲染 ---------- */
  const renderAcademic = () => (
    <>
      <Section title="Learning style">
        <View style={styles.rowWrap}>
          {['Solo', 'Group', 'Tutor-guided'].map((k) => (
            <Chip key={k} label={k} selected={learningStyle === k} onPress={() => setLearningStyle(k)} />
          ))}
        </View>
      </Section>

      <Section title="Study focus (multi)">
        <View style={styles.rowWrap}>
          {['Exam prep', 'Research', 'Thesis', 'Certification', 'Skill building'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={studyFocus.includes(k)}
              onPress={() => toggle(studyFocus, setStudyFocus, k)}
            />
          ))}
        </View>
      </Section>
    </>
  );

  const renderCareer = () => (
    <>
      <Section title="Goal type">
        <View style={styles.rowWrap}>
          {['Internship', 'Job', 'Career switch', 'Startup'].map((k) => (
            <Chip key={k} label={k} selected={careerType === k} onPress={() => setCareerType(k)} />
          ))}
        </View>
      </Section>

      <Section title="Key focus (multi)">
        <View style={styles.rowWrap}>
          {['Resume', 'Portfolio', 'Interview', 'Networking', 'Skill project'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={careerFocus.includes(k)}
              onPress={() => toggle(careerFocus, setCareerFocus, k)}
            />
          ))}
        </View>
      </Section>

      <Section title="Preferred region">
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
      <Section title="Goal theme">
        <View style={styles.rowWrap}>
          {['Fitness', 'Finance', 'Travel', 'Mindfulness', 'Learning'].map((k) => (
            <Chip key={k} label={k} selected={theme === k} onPress={() => setTheme(k)} />
          ))}
        </View>
      </Section>

      <Section title="Routine frequency">
        <View style={styles.rowWrap}>
          {['Daily', 'Weekly', 'Monthly'].map((k) => (
            <Chip key={k} label={k} selected={routine === k} onPress={() => setRoutine(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Support need: ${supportLevel}/10`}>
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={supportLevel}
          onValueChange={setSupportLevel}
        />
      </Section>
    </>
  );

  const renderHabit = () => (
    <>
      <Section title="Habit focus">
        <View style={styles.rowWrap}>
          {['Reading', 'Coding', 'Language', 'Instrument', 'Meditation'].map((k) => (
            <Chip key={k} label={k} selected={habitType === k} onPress={() => setHabitType(k)} />
          ))}
        </View>
      </Section>

      <Section title="Learning tools (multi)">
        <View style={styles.rowWrap}>
          {['App', 'Book', 'Course', 'Community', 'Mentor'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={learningTools.includes(k)}
              onPress={() => toggle(learningTools, setLearningTools, k)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Session duration: ${sessionDuration} min`}>
        <Slider
          minimumValue={10}
          maximumValue={120}
          step={5}
          value={sessionDuration}
          onValueChange={setSessionDuration}
        />
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
        return <Text style={{ textAlign: 'center', color: '#6B7280', marginVertical: 20 }}>No details available.</Text>;
    }
  }, [cat, learningStyle, studyFocus, careerType, careerFocus, region, theme, routine, supportLevel, habitType, learningTools, sessionDuration]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Setup</Text>
      <Text style={styles.subtitle}>Define how you’ll approach this goal.</Text>

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

/* ---------- 樣式 ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#F9FAFB' },
  title: { fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 6, color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 12 },
  section: { marginTop: 10 },
  sectionTitle: { fontWeight: '700', color: '#111827', fontSize: 15 },
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
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
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