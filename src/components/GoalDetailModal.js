// components/GoalDetailModal.js
import React from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabaseClient';

export default function GoalDetailModal({ visible, onClose, plan, title, onStatusChange }) {
  // ✅ 切換完成狀態
  const toggleDone = async (subgoal) => {
    const newStatus = subgoal.status === 'done' ? 'pending' : 'done';
    await supabase.from('subgoals').update({ status: newStatus }).eq('id', subgoal.id);
    if (onStatusChange) onStatusChange(subgoal.goal_id, subgoal.id, newStatus);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>{title}</Text>

        {plan?.length ? (
          plan.map((phase, i) => (
            <View key={i} style={styles.phaseBlock}>
              <Text style={styles.phaseTitle}>
                {phase.title || `Phase ${phase.phase_no}`}
              </Text>
              {phase.subgoals.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.subgoalRow,
                    s.status === 'done' && styles.subgoalDone,
                  ]}
                  onPress={() => toggleDone(s)}
                >
                  <Text style={[styles.subgoalText, s.status === 'done' && { color: '#888' }]}>
                    {s.status === 'done' ? '✅ ' : '⬜ '}
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No detailed plan available.</Text>
        )}

        <View style={styles.btnWrap}>
          <Button title="Close" onPress={onClose} />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#666' },
  phaseBlock: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  phaseTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  subgoalRow: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  subgoalDone: { backgroundColor: '#f2f2f2' },
  subgoalText: { fontSize: 14, lineHeight: 20 },
  btnWrap: { marginTop: 20, alignItems: 'center' },
});