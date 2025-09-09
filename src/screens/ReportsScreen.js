// screens/ReportsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// 如果不是 Expo，要改成： import LinearGradient from 'react-native-linear-gradient';
import { useGoals, calcProgress } from '../contexts/GoalsContext';

export default function ReportsScreen({ navigation }) {
  const { goals } = useGoals();

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => calcProgress(g) === 100).length;
  const pendingGoals = totalGoals - completedGoals;
  const successRate = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#333333', '#878787']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Analytics</Text>
          
          <View style={styles.divider} /> 

          <View style={styles.cardsRow}>
            {/* Total Goals */}
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('TotalGoals', { totalGoals })}
            >
              <Text style={styles.cardLabel}>Total Goals</Text>
              <Text style={styles.cardValue}>{totalGoals}</Text>
            </Pressable>

            {/* Completed Goals */}
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('CompletedGoals', { completedGoals })}
            >
              <Text style={styles.cardLabel}>Completed Goals</Text>
              <Text style={styles.cardValue}>{completedGoals}</Text>
            </Pressable>

            {/* Pending Goals */}
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('PendingGoals', { pendingGoals })}
            >
              <Text style={styles.cardLabel}>Pending Goals</Text>
              <Text style={styles.cardValue}>{pendingGoals}</Text>
            </Pressable>

            {/* Success Rate */}
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('SuccessRate', { successRate })}
            >
              <Text style={styles.cardLabel}>Success Rate</Text>
              <Text style={styles.cardValue}>{successRate}%</Text>
            </Pressable>
           </View> 

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <Text style={styles.sectionText}>
              You have completed {completedGoals} out of {totalGoals} goals.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Progress</Text>
            <Text style={styles.sectionText}>
              This section will show your monthly trend once tracking is implemented.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#333333' },
  gradient: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
    alignItems: 'center',
  },

  pageTitle: {
    width: '100%',
    maxWidth: 960,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,   // 原本 12，縮短讓 divider 更貼近標題
  },

  // 👇 新增的分隔線樣式
  divider: {
    height: StyleSheet.hairlineWidth,       // 平台最細的線
    backgroundColor: 'rgba(255,255,255,0.2)', // 淺白，帶點透明
    width: '100%',
    maxWidth: 960,
    marginBottom: 16,  // 與下方內容的間距
  },

  cardsRow: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.92,
    marginBottom: 8,
  },
  cardValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },

  section: {
    width: '100%',
    maxWidth: 960,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  sectionText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});

