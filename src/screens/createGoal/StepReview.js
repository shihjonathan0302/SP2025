// screens/createGoal/StepReview.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import StepResult from './StepResult'; // ✅ 新增結果畫面整合

// ✅ Supabase Edge Function 雲端 URL
const FUNC_URL = 'https://baygppmzqzisddezwyrs.functions.supabase.co/breakdown';

/** 組合結構化 JSON prompt（提供給 Gemini） */
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

/** 呼叫 Gemini Edge Function */
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

/** 計算天數差 */
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
      setShowResult(true); // ✅ 顯示結果畫面
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

      // 1️⃣ 插入目標主檔
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

      // 2️⃣ 插入子目標
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

  // ✅ 切換到結果畫面
  if (showResult && aiPlan) {
    return (
      <StepResult
        aiPlan={aiPlan}
        onSave={handleSaveToDB}
        onBack={() => setShowResult(false)}
      />
    );
  }

  // ✅ 預設畫面：回顧目標、產生 AI 計畫
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review & Generate AI Plan</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <Text>{formData.category || '-'}</Text>

        <Text style={styles.label}>Goal Name</Text>
        <Text>{formData.title || '-'}</Text>

        <Text style={styles.label}>Description</Text>
        <Text>{formData.description || '-'}</Text>

        <Text style={styles.label}>Phases</Text>
        <Text>{formData.numPhases || 3}</Text>
      </View>

      {!aiPlan && !loading && (
        <Button title="🧠 Generate AI Breakdown" onPress={handleGeneratePlan} />
      )}
      {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontWeight: '600', marginTop: 8, color: '#444' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});