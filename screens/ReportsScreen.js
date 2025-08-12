// screens/ReportsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGoals, calcProgress } from '../contexts/GoalsContext';

export default function ReportsScreen() {
  const { goals } = useGoals();

  // Calculations
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => calcProgress(g) === 100).length;
  const pendingGoals = totalGoals - completedGoals;
  const successRate = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Reports & Analytics</Text>

      {/* Statistic Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Goals</Text>
          <Text style={styles.cardValue}>{totalGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Completed Goals</Text>
          <Text style={styles.cardValue}>{completedGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending Goals</Text>
          <Text style={styles.cardValue}>{pendingGoals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Success Rate</Text>
          <Text style={styles.cardValue}>{successRate}%</Text>
        </View>
      </View>

      {/* Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <Text style={styles.sectionText}>
          You have completed {completedGoals} out of {totalGoals} goals.
        </Text>
      </View>

      {/* Monthly Progress - Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Progress</Text>
        <Text style={styles.sectionText}>
          This section will show your monthly trend once tracking is implemented.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '47%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2
  },
  cardLabel: { fontSize: 14, color: '#555', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#333' },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    elevation: 1
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#555', lineHeight: 20 }
});
