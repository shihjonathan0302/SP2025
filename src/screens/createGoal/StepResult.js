// screens/createGoal/StepResult.js
import React from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import GoalSummaryCard from '../../components/GoalSummaryCard';

export default function StepResult({ aiPlan, onSave, onBack }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI-Generated Goal Plan</Text>

      {aiPlan?.length ? (
        aiPlan.map((phase) => <GoalSummaryCard key={phase.phase_no} phase={phase} />)
      ) : (
        <Text style={styles.empty}>No plan generated yet.</Text>
      )}

      <View style={styles.navBtns}>
        <Button title="← Back" onPress={onBack} />
        <Button title="💾 Save to Dashboard" onPress={onSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f7f8fa' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
  navBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});