import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoals } from '../../contexts/GoalsContext'; 

export default function SuccessRateScreen({ navigation }) {
  const { goals } = useGoals();
  const total = goals.length;
  const completed = goals.filter((g) => g.subgoals?.every((s) => s.isDone)).length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const { width, height } = useWindowDimensions();
  const L = Math.max(width, height);
  const digits = String(successRate).length + 1; // 加上 %
  const base = digits === 2 ? 0.68 : digits === 3 ? 0.48 : 0.40;
  const fontSize = Math.max(180, Math.min(L * base, 360));

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#696969', '#6D6858']} style={styles.gradient}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <View style={styles.body}>
          <Text style={styles.title}>Success Rate</Text>
          <Text style={styles.subtitle}>
            {`You've completed ${completed} of ${total} goals.`}
          </Text>
        </View>

        <Text numberOfLines={1} style={[styles.watermark, { fontSize }]}>
          {successRate}%
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#696969' },
  gradient: { flex: 1, overflow: 'hidden' },
  closeBtn: {
    position: 'absolute',
    top: 10, right: 12, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  closeText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  body: { paddingTop: 56, paddingHorizontal: 16 },
  title: { fontSize: 24, fontFamily: 'SFProDisplay-Bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#ddd' },
  watermark: {
    position: 'absolute', bottom: -70, right: -10,
    fontFamily: 'SFProDisplay-Heavy',
    color: 'rgba(255,255,255,0.14)',
  },
});
