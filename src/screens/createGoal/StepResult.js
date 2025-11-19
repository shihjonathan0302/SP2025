// screens/createGoal/StepResult.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabaseClient';

/* ---------- PhaseCard ---------- */
function PhaseCard({ phase }) {
  const preview = Array.isArray(phase?.subgoals)
    ? phase.subgoals.slice(0, 6)
    : [];

  return (
    <View style={styles.card}>
      <Text style={styles.phaseTitle}>{phase.title}</Text>

      {!!phase.summary && (
        <Text style={styles.phaseSummary} numberOfLines={4}>
          {phase.summary}
        </Text>
      )}

      {preview.map((s, i) => (
        <View key={i} style={styles.subgoalItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.subText} numberOfLines={1}>
            {s.title}
          </Text>
        </View>
      ))}

      {phase.subgoals?.length > 6 && (
        <Text style={styles.moreText}>
          +{phase.subgoals.length - 6} more...
        </Text>
      )}
    </View>
  );
}

/* ---------- Main ---------- */
export default function StepResult({ formData, prevStep, navigation }) {
  const [saving, setSaving] = useState(false);
  const aiPlan = Array.isArray(formData?.aiPlan) ? formData.aiPlan : [];

  useEffect(() => {
    if (aiPlan?.length) {
      console.log('[AI plan full detail]', JSON.stringify(aiPlan, null, 2));
    }
  }, [aiPlan]);

  /* ---------- SAVE ---------- */
  const handleSave = useCallback(async () => {
    if (!aiPlan.length) {
      Alert.alert('No plan', 'Please generate a plan first.');
      return;
    }

    setSaving(true);
    try {
      /* ------- 取得 user ------- */
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) throw error;
      const userId = userData?.user?.id;
      if (!userId) throw new Error('User not logged in.');

      /* ------- 儲存 goal ------- */
      const goal = {
        user_id: userId,
        title: formData.title || 'Untitled Goal',
        category: formData.category || 'General',
        description: formData.description || '',
        priority: formData.priority || 'Medium',
        num_phases: formData.numPhases || 3,
        current_phase: 1,
        start_date: new Date(formData.startDate).toISOString(),
        target_date: new Date(formData.targetDate).toISOString(),
        eta_days: formData.etaDays || 30,
      };

      const { data: insertedGoal, error: gErr } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single();

      if (gErr) throw gErr;
      const goalId = insertedGoal.id;
      console.log('🎯 Goal saved:', goalId);

      /* ------- 自動分配 due_date ------- */
      let pointer = new Date(formData.startDate); // 從 startDate 開始往後排
      const subRows = [];

      for (const p of aiPlan) {
        const subs = p.subgoals || [];

        for (const s of subs) {
          const due = new Date(pointer);

          subRows.push({
            goal_id: goalId,
            phase_number: p.phase_no,
            phase_name: p.title,
            subgoal_title: s.title,
            subgoal_description: s.title,
            status: 'pending',
            due_date: due.toISOString().slice(0, 10), // YYYY-MM-DD
          });

          // 每個 subgoal 往後 +1 天
          pointer.setDate(pointer.getDate() + 1);
        }
      }

      console.log('🟦 Subgoals to insert =', subRows.length);

      if (subRows.length) {
        const { error: subErr } = await supabase.from('subgoals').insert(subRows);
        if (subErr) throw subErr;
      }

      Alert.alert('✅ Success', 'Goal saved to Dashboard.');
      navigation?.goBack?.();
    } catch (err) {
      console.error('[Save error]', err);
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }, [aiPlan, formData, navigation]);

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={aiPlan}
          renderItem={({ item }) => <PhaseCard phase={item} />}
          keyExtractor={(item, idx) => String(idx)}
          ListHeaderComponent={<Text style={styles.title}>🎯 AI-Generated Goal Plan</Text>}
          ListFooterComponent={
            <View style={styles.footer}>
              <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                <Text style={styles.btnText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>💾 Save to Dashboard</Text>}
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  listContainer: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phaseTitle: { fontWeight: '700', fontSize: 16, color: '#1E3A8A', marginBottom: 4 },
  phaseSummary: { color: '#374151', fontSize: 13, marginBottom: 6 },
  subgoalItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  bullet: { color: '#2563EB', fontSize: 13, marginRight: 6 },
  subText: { color: '#111827', fontSize: 13, flex: 1 },
  moreText: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 },
  backBtn: {
    backgroundColor: '#9CA3AF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});