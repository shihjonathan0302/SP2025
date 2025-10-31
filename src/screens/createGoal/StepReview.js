// screens/createGoal/StepReview.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import StepResult from './StepResult';

const FUNC_URL = 'https://baygppmzqzisddezwyrs.functions.supabase.co/breakdown';

/* 🧩 組合傳給 AI 的 Payload */
function buildGoalPayload(formData) {
  const start = formData.startDate instanceof Date ? formData.startDate : new Date();
  const target = formData.targetDate instanceof Date ? formData.targetDate : new Date();
  const etaDays = diffDays(start, target);

  return {
    category: formData.category,
    goal_name: formData.title,
    estimated_time: `${etaDays} days`,
    motivation: formData.motivation || formData.description || '',
    priority: formData.priority || 'Medium',
    description: formData.description || '',
    details: formData.details || {},
    etaDays,
    numPhases: formData.numPhases || 3,
  };
}

/* 🧠 呼叫 Supabase Edge Function */
async function callAI(payload) {
  const res = await fetch(FUNC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}) ${msg}`);
  }
  return res.json();
}

/* 📆 計算天數差 */
function diffDays(a, b) {
  try {
    const ms = b.getTime() - a.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  } catch {
    return 30;
  }
}

export default function StepReview({ formData, prevStep, goBackToMain }) {
  const [loading, setLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);

  /** 🧠 產生 AI 計畫 */
  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const payload = buildGoalPayload(formData);
      console.log('[Sending to Gemini]', payload);
      const data = await callAI(payload);
      setAiPlan(data);
      setShowResult(true);
    } catch (err) {
      console.error('[AI Error]', err);
      Alert.alert('AI Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  /** 💾 儲存資料到 Supabase */
  const handleSaveToDB = async () => {
    if (!aiPlan || saved) return;
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User not logged in.');

      const start = formData.startDate instanceof Date ? formData.startDate : new Date();
      const target = formData.targetDate instanceof Date ? formData.targetDate : new Date();
      const days = diffDays(start, target);

      const insertGoal = {
        user_id: userId,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        motivation: formData.motivation || '',
        priority: formData.priority || 'Medium',
        start_date: start.toISOString(),
        target_date: target.toISOString(),
        eta_days: days,
        num_phases: formData.numPhases,
        current_phase: 1,
      };

      const { data: goals, error: gErr } = await supabase.from('goals').insert([insertGoal]).select();
      if (gErr) throw gErr;
      const goalId = goals?.[0]?.id;
      if (!goalId) throw new Error('Failed to create goal.');

      // 插入子目標
      const subInserts = [];
      for (const phase of aiPlan) {
        for (const s of phase.subgoals || []) {
          subInserts.push({
            goal_id: goalId,
            phase_number: phase.phase_no,
            phase_name: phase.title,
            subgoal_title: s.title,
            subgoal_description: s.title,
            status: 'pending',
          });
        }
      }

      const { error: sErr } = await supabase.from('subgoals').insert(subInserts);
      if (sErr) throw sErr;

      setSaved(true);
      Alert.alert('✅ Success', 'Goal and AI plan saved!');
      goBackToMain();
    } catch (err) {
      console.error('[Save error]', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* 🎯 如果已生成 AI 結果 → 顯示結果頁 */
  if (showResult && aiPlan) {
    return (
      <StepResult
        aiPlan={aiPlan}
        onSave={handleSaveToDB}
        onBack={() => setShowResult(false)}
      />
    );
  }

  /* 🧭 預設畫面：回顧 + 生成 */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Your Goal</Text>
      <Text style={styles.subtitle}>Check the details before generating your AI plan.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{formData.category || '-'}</Text>

        <Text style={styles.label}>Goal Name</Text>
        <Text style={styles.value}>{formData.title || '-'}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{formData.description || '-'}</Text>

        <Text style={styles.label}>Motivation</Text>
        <Text style={styles.value}>{formData.motivation || '-'}</Text>

        <Text style={styles.label}>Phases</Text>
        <Text style={styles.value}>{formData.numPhases || 3}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 20 }} />
      ) : (
        <TouchableOpacity style={styles.mainBtn} onPress={handleGeneratePlan}>
          <Text style={styles.mainBtnText}>🧠 Generate AI Breakdown</Text>
        </TouchableOpacity>
      )}

      <View style={styles.navBtns}>
        <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 22,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 2,
  },
  value: {
    color: '#111827',
    fontSize: 15,
  },
  mainBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  navBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  backBtnText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
});