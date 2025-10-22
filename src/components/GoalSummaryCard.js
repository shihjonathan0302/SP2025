// components/GoalSummaryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SubgoalItem from './SubgoalItem';

export default function GoalSummaryCard({ phase }) {
  return (
    <View style={styles.card}>
      <Text style={styles.phaseTitle}>{phase.title}</Text>
      {phase.summary && <Text style={styles.summary}>{phase.summary}</Text>}

      <View style={styles.sectionRow}>
        <Text style={styles.label}>Start Condition:</Text>
        <Text style={styles.value}>{phase.start_condition || '-'}</Text>
      </View>
      <View style={styles.sectionRow}>
        <Text style={styles.label}>End Condition:</Text>
        <Text style={styles.value}>{phase.end_condition || '-'}</Text>
      </View>

      <View style={styles.subgoalList}>
        {phase.subgoals?.map((s, idx) => (
          <SubgoalItem key={idx} subgoal={s} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  phaseTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  summary: { color: '#555', marginBottom: 8 },
  sectionRow: { marginBottom: 4 },
  label: { fontWeight: '600', color: '#444' },
  value: { color: '#333' },
  subgoalList: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
});