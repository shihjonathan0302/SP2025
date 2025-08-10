// screens/GoalDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GoalDetailScreen({ route }) {
  const { goalId, title } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal Detail</Text>
      <Text>ID: {goalId ?? '-'}</Text>
      <Text>Title: {title ?? '-'}</Text>
      <Text style={{ marginTop: 12, color: '#666' }}>
        （之後會在這裡顯示 subgoals 清單與勾選狀態）
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
});