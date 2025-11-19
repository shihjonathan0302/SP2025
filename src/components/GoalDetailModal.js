// components/GoalDetailModal.js
import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { supabase } from '../lib/supabaseClient';
import * as db from '../services/db';

export default function GoalDetailModal({ visible, onClose, plan, title, goalId, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState(plan || []);

  const load = useCallback(async () => {
    if (!goalId || plan?.length) return;
    setLoading(true);
    try {
      const data = await db.getGoalPhases(goalId);
      setPhases(data);
      console.log('[GoalDetailModal] phases =', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[GoalDetailModal] load error:', e);
    } finally {
      setLoading(false);
    }
  }, [goalId, plan]);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const toggleDone = async (subgoal) => {
    const newStatus = subgoal.status === 'done' ? 'pending' : 'done';
    await supabase.from('subgoals').update({ status: newStatus }).eq('id', subgoal.id);
    if (onStatusChange) onStatusChange(subgoal.goal_id, subgoal.id, newStatus);
    // 前端同步
    setPhases((ps) =>
      ps.map((p) => ({
        ...p,
        subgoals: p.subgoals.map((s) => (s.id === subgoal.id ? { ...s, status: newStatus } : s)),
      }))
    );
  };

  const renderPhase = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.phaseTitle}>{item.title || `Phase ${item.phase_number}`}</Text>
      {(item.subgoals || []).map((s) => (
        <TouchableOpacity key={s.id} style={styles.subRow} onPress={() => toggleDone(s)}>
          <Text style={styles.box}>{s.status === 'done' ? '✅' : '⬜'}</Text>
          <Text style={styles.subText}>{s.subgoal_title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <Text style={styles.header}>{title}</Text>

        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : phases?.length ? (
          <FlatList
            data={phases}
            renderItem={renderPhase}
            keyExtractor={(p, idx) => String(p.phase_number ?? idx)}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator
          />
        ) : (
          <View style={styles.center}><Text style={{ color: '#666' }}>No detailed plan available.</Text></View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  phaseTitle: { fontWeight: '800', fontSize: 16, color: '#1E3A8A', marginBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  box: { width: 22, textAlign: 'center', marginRight: 6 },
  subText: { flex: 1, color: '#111827', lineHeight: 20 },
  footer: { padding: 16 },
  closeBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});