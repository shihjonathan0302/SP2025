// screens/createGoal/StepDetails_Page2.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function Chip({ label, selected, onPress }) {
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
function Section({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

export default function StepDetails_Page2({ formData, updateFormData, goPrevPage, goNextPage }) {
  const cat = formData.category;

  // 讀取 Page1 的 hours_per_week 來當預設
  const insights = formData.insights || {};
  const defaultHours = typeof insights.hours_per_week === 'number' ? insights.hours_per_week : 4;

  // 各類別本地狀態
  // Academic
  const [academicTrack, setAcademicTrack] = useState('exam'); // exam | thesis | research_project | coursework
  const [examType, setExamType] = useState('TOEFL'); // when exam
  const [examOther, setExamOther] = useState('');

  const [targetLevel, setTargetLevel] = useState('target_score'); // safe_pass | target_score | aggressive_goal
  const [studyDays, setStudyDays] = useState(4); // 1-7
  const [sessionHours, setSessionHours] = useState(2); // 0.5-4
  const [resources, setResources] = useState([]); // multi

  // Career
  const [careerPath, setCareerPath] = useState('internship'); // internship | full_time | career_switch | portfolio_build
  const [careerField, setCareerField] = useState('data_analytics');
  const [deliverables, setDeliverables] = useState([]); // multi
  const [hoursPerWeek, setHoursPerWeek] = useState(defaultHours);
  const [region, setRegion] = useState('TW'); // TW | EU | NA | Remote

  // Personal
  const [personalCategory, setPersonalCategory] = useState('fitness');
  const [progressMode, setProgressMode] = useState('habit_streak'); // habit_streak | weekly_checkin | milestone_based
  const [difficulty, setDifficulty] = useState(5); // 1-10
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerFrequency, setPartnerFrequency] = useState('weekly'); // daily | weekly

  // Habits
  const [habitType, setHabitType] = useState('language');
  const [habitFreq, setHabitFreq] = useState('daily'); // daily | 3x_week | weekly
  const [habitMinutes, setHabitMinutes] = useState(30); // 10-90
  const [habitMethod, setHabitMethod] = useState([]); // multi

  // 若已有 categoryDetails（返回修正時），做一次性預填
  useEffect(() => {
    const saved = formData.categoryDetails || {};
    if (!saved.__filled) return;

    if (cat === 'Academic and Education') {
      setAcademicTrack(saved.academic_track || 'exam');
      setExamType(saved.exam_type || 'TOEFL');
      setExamOther(saved.exam_other || '');
      setTargetLevel(saved.target_level || 'target_score');
      setStudyDays(typeof saved.study_days === 'number' ? saved.study_days : 4);
      setSessionHours(typeof saved.session_hours === 'number' ? saved.session_hours : 2);
      setResources(saved.resources || []);
    } else if (cat === 'Career and Professional') {
      setCareerPath(saved.career_path || 'internship');
      setCareerField(saved.career_field || 'data_analytics');
      setDeliverables(saved.deliverables || []);
      setHoursPerWeek(typeof saved.hours_per_week === 'number' ? saved.hours_per_week : defaultHours);
      setRegion(saved.region || 'TW');
    } else if (cat === 'Personal and Lifestyle') {
      setPersonalCategory(saved.personal_category || 'fitness');
      setProgressMode(saved.progress_mode || 'habit_streak');
      setDifficulty(typeof saved.difficulty === 'number' ? saved.difficulty : 5);
      setHasPartner(!!saved.has_partner);
      setPartnerFrequency(saved.partner_frequency || 'weekly');
    } else if (cat === 'Habits and Learning') {
      setHabitType(saved.habit_type || 'language');
      setHabitFreq(saved.habit_freq || 'daily');
      setHabitMinutes(typeof saved.habit_minutes === 'number' ? saved.habit_minutes : 30);
      setHabitMethod(saved.habit_method || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 多選切換
  const toggle = (arr, setter, key) => {
    setter(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);
  };

  const onNext = async () => {
    // 構建 categoryDetails
    let payload = { __filled: true };

    if (cat === 'Academic and Education') {
      payload = {
        ...payload,
        academic_track: academicTrack,
        exam_type: academicTrack === 'exam' ? examType : undefined,
        exam_other: academicTrack === 'exam' && examType === 'Other' ? examOther : undefined,
        target_level: targetLevel,
        study_days: studyDays,
        session_hours: sessionHours,
        resources,
      };
    } else if (cat === 'Career and Professional') {
      payload = {
        ...payload,
        career_path: careerPath,
        career_field: careerField,
        deliverables,
        hours_per_week: hoursPerWeek,
        region,
      };
    } else if (cat === 'Personal and Lifestyle') {
      payload = {
        ...payload,
        personal_category: personalCategory,
        progress_mode: progressMode,
        difficulty,
        has_partner: hasPartner,
        partner_frequency: hasPartner ? partnerFrequency : undefined,
      };
    } else if (cat === 'Habits and Learning') {
      payload = {
        ...payload,
        habit_type: habitType,
        habit_freq: habitFreq,
        habit_minutes: habitMinutes,
        habit_method: habitMethod,
      };
    }

    updateFormData({ categoryDetails: payload });
    await delay(250);
    goNextPage();
  };

  // 依類別渲染不同題目
  const renderAcademic = () => (
    <>
      <Section title="Track">
        <View style={styles.rowWrap}>
          {['exam', 'thesis', 'research_project', 'coursework'].map((k) => (
            <Chip key={k} label={k.replace('_', ' ')} selected={academicTrack === k} onPress={() => setAcademicTrack(k)} />
          ))}
        </View>
      </Section>

      {academicTrack === 'exam' && (
        <Section title="Exam focus">
          <View style={styles.rowWrap}>
            {['TOEFL', 'GRE', 'IELTS', 'Other'].map((k) => (
              <Chip key={k} label={k} selected={examType === k} onPress={() => setExamType(k)} />
            ))}
          </View>
          {examType === 'Other' && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Which exam?</Text>
              <TextInput
                style={styles.input}
                placeholder="Type exam name"
                placeholderTextColor="#9CA3AF"
                value={examOther}
                onChangeText={setExamOther}
              />
            </View>
          )}
        </Section>
      )}

      <Section title="Target level">
        <View style={styles.rowWrap}>
          {[
            { k: 'safe_pass', l: 'Safe pass' },
            { k: 'target_score', l: 'Target score' },
            { k: 'aggressive_goal', l: 'Aggressive goal' },
          ].map((o) => (
            <Chip
              key={o.k}
              label={o.l}
              selected={targetLevel === o.k}
              onPress={() => setTargetLevel(o.k)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Study days / week: ${studyDays}`}>
        <Slider minimumValue={1} maximumValue={7} step={1} value={studyDays} onValueChange={setStudyDays} />
      </Section>

      <Section title={`Session length: ${sessionHours.toFixed(1)} h`}>
        <Slider minimumValue={0.5} maximumValue={4} step={0.5} value={sessionHours} onValueChange={setSessionHours} />
      </Section>

      <Section title="Resources">
        <View style={styles.rowWrap}>
          {['official_guide', 'online_course', 'yt_lectures', 'anki', 'tutor', 'mock_tests'].map((k) => (
            <MultiChip
              key={k}
              label={k.replace('_', ' ')}
              selected={resources.includes(k)}
              onPress={() => toggle(resources, setResources, k)}
            />
          ))}
        </View>
      </Section>
    </>
  );

  const renderCareer = () => (
    <>
      <Section title="Path">
        <View style={styles.rowWrap}>
          {['internship', 'full_time', 'career_switch', 'portfolio_build'].map((k) => (
            <Chip key={k} label={k.replace('_', ' ')} selected={careerPath === k} onPress={() => setCareerPath(k)} />
          ))}
        </View>
      </Section>

      <Section title="Field">
        <View style={styles.rowWrap}>
          {['data_analytics', 'marketing', 'software', 'finance', 'design', 'other'].map((k) => (
            <Chip key={k} label={k.replace('_', ' ')} selected={careerField === k} onPress={() => setCareerField(k)} />
          ))}
        </View>
      </Section>

      <Section title="Deliverables">
        <View style={styles.rowWrap}>
          {['resume', 'portfolio', 'linkedin', 'referrals', 'mock_interview'].map((k) => (
            <MultiChip
              key={k}
              label={k.replace('_', ' ')}
              selected={deliverables.includes(k)}
              onPress={() => toggle(deliverables, setDeliverables, k)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Weekly time: ${hoursPerWeek.toFixed(1)} h`}>
        <Slider minimumValue={0.5} maximumValue={20} step={0.5} value={hoursPerWeek} onValueChange={setHoursPerWeek} />
      </Section>

      <Section title="Job market region">
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
      <Section title="Category">
        <View style={styles.rowWrap}>
          {['fitness', 'nutrition', 'finance', 'travel', 'mindfulness', 'other'].map((k) => (
            <Chip key={k} label={k} selected={personalCategory === k} onPress={() => setPersonalCategory(k)} />
          ))}
        </View>
      </Section>

      <Section title="Progress tracking">
        <View style={styles.rowWrap}>
          {['habit_streak', 'weekly_checkin', 'milestone_based'].map((k) => (
            <Chip
              key={k}
              label={k.replace('_', ' ')}
              selected={progressMode === k}
              onPress={() => setProgressMode(k)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Difficulty (self rating): ${difficulty}/10`}>
        <Slider minimumValue={1} maximumValue={10} step={1} value={difficulty} onValueChange={setDifficulty} />
      </Section>

      <Section title="With a partner?">
        <View style={styles.inline}>
          <Text style={styles.inlineLabel}>{hasPartner ? 'Yes' : 'No'}</Text>
          <TouchableOpacity
            onPress={() => setHasPartner((v) => !v)}
            style={[styles.toggle, hasPartner && styles.toggleOn]}
            activeOpacity={0.8}
          >
            <View style={[styles.knob, hasPartner && styles.knobOn]} />
          </TouchableOpacity>
        </View>

        {hasPartner && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Partner frequency</Text>
            <View style={styles.rowWrap}>
              {['daily', 'weekly'].map((k) => (
                <Chip
                  key={k}
                  label={k}
                  selected={partnerFrequency === k}
                  onPress={() => setPartnerFrequency(k)}
                />
              ))}
            </View>
          </View>
        )}
      </Section>
    </>
  );

  const renderHabit = () => (
    <>
      <Section title="Habit type">
        <View style={styles.rowWrap}>
          {['language', 'coding', 'reading', 'workout', 'meditation', 'instrument', 'other'].map((k) => (
            <Chip key={k} label={k} selected={habitType === k} onPress={() => setHabitType(k)} />
          ))}
        </View>
      </Section>

      <Section title="Frequency">
        <View style={styles.rowWrap}>
          {['daily', '3x_week', 'weekly'].map((k) => (
            <Chip key={k} label={k.replace('_', ' ')} selected={habitFreq === k} onPress={() => setHabitFreq(k)} />
          ))}
        </View>
      </Section>

      <Section title={`Session length: ${habitMinutes} min`}>
        <Slider minimumValue={10} maximumValue={90} step={5} value={habitMinutes} onValueChange={setHabitMinutes} />
      </Section>

      <Section title="Method">
        <View style={styles.rowWrap}>
          {['app', 'yt', 'book', 'course', 'community'].map((k) => (
            <MultiChip
              key={k}
              label={k}
              selected={habitMethod.includes(k)}
              onPress={() => toggle(habitMethod, setHabitMethod, k)}
            />
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
        return (
          <View style={{ paddingVertical: 12 }}>
            <Text style={{ color: '#6B7280', textAlign: 'center' }}>No category-specific questions.</Text>
          </View>
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, academicTrack, examType, examOther, targetLevel, studyDays, sessionHours, resources,
      careerPath, careerField, deliverables, hoursPerWeek, region, personalCategory,
      progressMode, difficulty, hasPartner, partnerFrequency, habitType, habitFreq, habitMinutes, habitMethod]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Details</Text>
      <Text style={styles.subtitle}>Just tap to shape AI’s plan — no long typing.</Text>

      {content}

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtn} onPress={goPrevPage}>
          <Text style={styles.navBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.nextBtn]}
          onPress={async () => {
            await onNext();
          }}
        >
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
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, backgroundColor: '#fff',
  },
  label: { fontWeight: '600', color: '#374151', marginBottom: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inlineLabel: { fontWeight: '600', color: '#111827' },
  toggle: {
    width: 48, height: 28, borderRadius: 16, backgroundColor: '#E5E7EB',
    justifyContent: 'center', paddingHorizontal: 4,
  },
  toggleOn: { backgroundColor: '#2563EB' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navBtn: {
    paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10,
    borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff',
  },
  navBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
});