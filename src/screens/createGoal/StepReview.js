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
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';

const FUNC_URL = 'https://baygppmzqzisddezwyrs.functions.supabase.co/breakdown';

export default function StepReview({ formData, prevStep, goBackToMain }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1️⃣ 取得使用者
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error('User not logged in.');
      const userId = userData.user.id;

      // 2️⃣ 新增 goals 基本資料
      const { data: goalRows, error: goalErr } = await supabase
        .from('goals')
        .insert([
          {
            user_id: userId,
            title: formData.title,
            category: formData.category,
            description: formData.description,
            start_date: formData.startDate.toISOString(),
            target_date: formData.targetDate.toISOString(),
            num_phases: formData.numPhases,
            current_phase: 1,
            next_phase_unlocked: false,
          },
        ])
        .select();

      if (goalErr) throw goalErr;
      const goalId = goalRows[0].id;

      // 3️⃣ 呼叫 Edge Function 產生階段與子目標
      const aiBody = {
        title: formData.title,
        numPhases: formData.numPhases,
      };

      const res = await fetch(FUNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiBody),
      });

      if (!res.ok) throw new Error(`Edge function failed (${res.status})`);
      const breakdown = await res.json(); // 期望格式：[{phase_no, title, subgoals:[{title}]}]
      console.log('[AI Breakdown Result]', breakdown);

      // 4️⃣ 寫入 goal_phases + subgoals
      for (const p of breakdown) {
        const { data: phaseRows, error: phaseErr } = await supabase
          .from('goal_phases')
          .insert([
            {
              goal_id: goalId,
              phase_number: p.phase_no ?? 1, // ✅ 對應 Supabase schema
              phase_name: p.title ?? 'Untitled phase',
              start_date: formData.startDate.toISOString(),
              end_date: formData.targetDate.toISOString(),
              status: 'pending',
              summary: p.description ?? null,
              generated_detail: true,
            },
          ])
          .select();

        if (phaseErr) throw phaseErr;
        const phaseId = phaseRows[0].id;

        // 寫入該階段的子目標
        if (p.subgoals?.length) {
          const subInserts = p.subgoals.map((s, idx) => ({
            goal_id: goalId,
            phase_id: phaseId,
            title: s.title,
            is_done: false,
            order: idx + 1,
          }));
          const { error: subErr } = await supabase.from('subgoals').insert(subInserts);
          if (subErr) throw subErr;
        }
      }

      // 5️⃣ 完成提示
      Alert.alert('Success', 'Goal created with AI-generated subgoals!');
      goBackToMain();
    } catch (err) {
      console.error('[handleSubmit error]', err);
      Alert.alert('Error', String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Your Goal</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <Text>{formData.category}</Text>

        <Text style={styles.label}>Title</Text>
        <Text>{formData.title}</Text>

        <Text style={styles.label}>Description</Text>
        <Text>{formData.description}</Text>

        <Text style={styles.label}>Start Date</Text>
        <Text>{formData.startDate.toDateString()}</Text>

        <Text style={styles.label}>Target Date</Text>
        <Text>{formData.targetDate.toDateString()}</Text>

        <Text style={styles.label}>Phases</Text>
        <Text>{formData.numPhases}</Text>
      </View>

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={prevStep} />
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Button title="Create Goal →" onPress={handleSubmit} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 30 },
  label: { fontWeight: '600', marginTop: 10, color: '#444' },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between' },
});