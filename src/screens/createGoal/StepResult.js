// screens/createGoal/StepResult.js
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import GoalSummaryCard from '../../components/GoalSummaryCard';

export default function StepResult({ formData, onBack }) {
  const aiPlan = formData?.aiPlan || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🎯 AI-Generated Goal Plan</Text>

        {aiPlan.length ? (
          aiPlan.map((phase) => (
            <View key={phase.phase_no} style={styles.card}>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phaseSummary}>{phase.summary}</Text>
              <Text style={styles.condition}>
                <Text style={styles.bold}>Start:</Text> {phase.start_condition}
              </Text>
              <Text style={styles.condition}>
                <Text style={styles.bold}>End:</Text> {phase.end_condition}
              </Text>
              <View style={styles.subgoalList}>
                {phase.subgoals?.map((s, idx) => (
                  <View key={idx} style={styles.subgoalItem}>
                    <Text style={styles.subgoalDot}>•</Text>
                    <Text style={styles.subgoalText}>{s.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No AI plan generated.</Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.btnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- 樣式 ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  phaseTitle: { fontWeight: '700', fontSize: 17, color: '#1E3A8A', marginBottom: 6 },
  phaseSummary: { color: '#374151', fontSize: 14, marginBottom: 10 },
  condition: { color: '#6B7280', fontSize: 13, marginBottom: 2 },
  bold: { fontWeight: '600', color: '#111827' },
  subgoalList: { marginTop: 8 },
  subgoalItem: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
  subgoalDot: { color: '#2563EB', marginRight: 6, fontSize: 14 },
  subgoalText: { color: '#111827', flex: 1, fontSize: 14, lineHeight: 20 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});