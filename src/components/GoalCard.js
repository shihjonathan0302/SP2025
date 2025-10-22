// components/GoalCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

export default function GoalCard({ goal, progress = 0, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(goal)}>
      <Text style={styles.title}>{goal.title}</Text>
      <Text style={styles.category}>{goal.category}</Text>
      <Text style={styles.date}>
        {new Date(goal.start_date).toLocaleDateString()} →{' '}
        {new Date(goal.target_date).toLocaleDateString()}
      </Text>
      <ProgressBar progress={progress} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  category: { fontSize: 14, color: '#777', marginBottom: 6 },
  date: { fontSize: 12, color: '#999', marginBottom: 8 },
});