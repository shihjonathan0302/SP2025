// screens/createGoal/StepReview.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';

const FUNC_URL = 'https://baygppmzqzisddezwyrs.functions.supabase.co/breakdown';

/* ---------- 日期輔助 ---------- */
function addMonthsSafe(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}
function diffDays(a, b) {
  try {
    const ms = b.getTime() - a.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  } catch {
    return 30;
  }
}
function formatYMD(d) {
  if (!(d instanceof Date)) return '-';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function computeDates(formData) {
  const start = formData.startDate instanceof Date ? formData.startDate : new Date();
  let target;
  if (formData.timeMode === 'months') {
    const months = typeof formData.months === 'number' ? formData.months : 3;
    target = addMonthsSafe(start, months);
  } else {
    target = formData.targetDate instanceof Date ? formData.targetDate : addMonthsSafe(start, 3);
  }
  const etaDays = diffDays(start, target);
  return { start, target, etaDays };
}

/* ---------- 組合傳給 AI 的 Payload ---------- */
function buildGoalPayload(formData) {
  const { start, target, etaDays } = computeDates(formData);
  const title = (formData.title || formData.goal_name || '').trim() || 'Untitled Goal';

  return {
    title,
    category: formData.category || 'General',
    description: formData.description || '',
    motivation: formData.motivation || '',
    priority: formData.priority || 'Medium',
    timeMode: formData.timeMode || 'deadline',
    months: typeof formData.months === 'number' ? formData.months : undefined,
    startDate: formatYMD(start),
    targetDate: formatYMD(target),
    etaDays,
    numPhases: formData.numPhases || 3,
    context: {
      insights: formData.insights || {},
      categoryDetails: formData.categoryDetails || {},
      constraints: formData.constraints || {},
      cadence: formData.cadence || {},
      environment: formData.environment || {},
      outcome: formData.outcome || {},
      notes: formData.additionalInfo || '',
    },
  };
}

/* ---------- 呼叫 Supabase Edge Function ---------- */
async function callAI(payload) {
  const res = await fetch(FUNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`AI request failed (${res.status}) ${txt}`);
  return JSON.parse(txt);
}

/* ---------- 可愛 Loading 動畫 ---------- */
function GeneratingOverlay() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: true }),
        ])
      );

    const anims = [createAnim(dot1, 0), createAnim(dot2, 150), createAnim(dot3, 300)];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.overlayText}>Generating your AI plan</Text>
      <View style={styles.dotRow}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
      <Text style={styles.overlaySub}>This may take around 10–15 seconds</Text>
    </View>
  );
}

export default function StepReview({ formData, updateFormData, goNextPage, goPrevPage }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const summary = useMemo(() => {
    const { start, target, etaDays } = computeDates(formData);
    return {
      category: formData.category || '-',
      goal: (formData.title || '').trim() || '-',
      durationText:
        formData.timeMode === 'months'
          ? `${formData.months ?? 3} months (${formatYMD(start)} → ${formatYMD(target)})`
          : `${etaDays} days (${formatYMD(start)} → ${formatYMD(target)})`,
      priority: formData.priority || 'Medium',
      phases: `${formData.numPhases || 3} stages`,
    };
  }, [formData]);

  /* ---------- 產生 AI 計劃 ---------- */
  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const payload = buildGoalPayload(formData);
      const data = await callAI(payload);
      updateFormData({ aiPlan: data });
      goNextPage(); // ⬅️ 進入 Step 9（StepResult）
    } catch (err) {
      console.error('[AI Error]', err);
      Alert.alert('AI Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 儲存資料 ---------- */
  const handleSaveToDB = async () => {
    if (!formData.aiPlan || saved) return;
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User not logged in.');

      const { start, target, etaDays } = computeDates(formData);
      const goalObj = {
        user_id: userId,
        title: formData.title,
        category: formData.category,
        description: formData.description || '',
        priority: formData.priority || 'Medium',
        start_date: start.toISOString(),
        target_date: target.toISOString(),
        eta_days: etaDays,
        num_phases: formData.numPhases || 3,
        current_phase: 1,
      };

      const { data: goals, error: gErr } = await supabase.from('goals').insert([goalObj]).select();
      if (gErr) throw gErr;

      const goalId = goals?.[0]?.id;
      const subInserts = [];
      for (const phase of formData.aiPlan) {
        for (const s of phase.subgoals || []) {
          subInserts.push({
            goal_id: goalId,
            phase_number: phase.phase_no,
            phase_name: phase.title,
            subgoal_title: s.title,
            subgoal_description: s.title || '',
            status: 'pending',
          });
        }
      }
      if (subInserts.length) await supabase.from('subgoals').insert(subInserts);

      setSaved(true);
      Alert.alert('✅ Success', 'Goal and AI plan saved!');
    } catch (err) {
      console.error('[Save error]', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <GeneratingOverlay />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Your Goal</Text>
      <Text style={styles.subtitle}>Quickly check the essentials before generating your AI plan.</Text>

      <View style={styles.card}>
        <Row icon="🏷️" label="Category" value={summary.category} />
        <Row icon="🎯" label="Goal" value={summary.goal} />
        <Row icon="🕒" label="Duration" value={summary.durationText} />
        <Row icon="⭐" label="Priority" value={summary.priority} />
        <Row icon="📅" label="Phases" value={summary.phases} />
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handleGeneratePlan}>
        <Text style={styles.mainBtnText}>✨ Generate AI Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={goPrevPage}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- 小元件 ---------- */
function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        <Text style={{ fontSize: 16 }}>{icon} </Text>
        {label}
      </Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/* ---------- 樣式 ---------- */
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F9FAFB' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowLabel: { fontWeight: '600', color: '#374151', marginBottom: 4 },
  rowValue: { color: '#111827', fontSize: 15 },
  mainBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn: {
    alignSelf: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backBtnText: { color: '#111827', fontWeight: '600', fontSize: 15 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  overlayText: { marginTop: 16, fontSize: 20, fontWeight: '700', color: '#111827' },
  overlaySub: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  dotRow: { flexDirection: 'row', marginTop: 14 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginHorizontal: 4,
  },
});