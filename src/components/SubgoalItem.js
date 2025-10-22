// components/SubgoalItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native'; // 使用 lucide-react-native 圖示

export default function SubgoalItem({ subgoal }) {
  return (
    <View style={styles.row}>
      <CheckCircle size={18} color="#4a90e2" style={{ marginRight: 6 }} />
      <Text style={styles.text}>{subgoal.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  text: { color: '#333', flexShrink: 1 },
});