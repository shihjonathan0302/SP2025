// screens/GoalDetailScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as db from '../../services/db'; // ← 路徑依你的專案位置調整（例：'../../services/db'）

export default function GoalDetailScreen({ route, navigation }) {
  const { goalId, goalTitle } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 直接用 db.getGoalPhases(goalId)（我已在 db.js 幫你整理好）
      const data = await db.getGoalPhases(goalId);
      setPhases(data);
      // Debug 到 terminal
      console.log('[GoalDetailScreen] phases =', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[GoalDetailScreen] load error:', e);
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false); // ← 不管成功失敗都關掉 spinner
    }
  }, [goalId]);

  useEffect(() => {
    load();
  }, [load]);

  const renderPhase = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.phaseTitle}>{item.title || `Phase ${item.phase_number}`}</Text>
      {!!item.summary && <Text style={styles.phaseSummary}>{item.summary}</Text>}
      {(item.subgoals || []).map((s, i) => (
        <View key={i} style={styles.subRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.subText}>
            {s.subgoal_title}
            {s.status === 'done' ? '  ✅' : ''}
          </Text>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.header}>{goalTitle || 'Goal detail'}</Text>

      {error ? (
        <View style={styles.center}>
          <Text style={{ color: '#c00', marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={load}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : phases.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: '#666' }}>No detailed plan available.</Text>
        </View>
      ) : (
        // 這裡用單一 FlatList（**不要**再包 ScrollView），避免 VirtualizedList 警告
        <FlatList
          data={phases}
          renderItem={renderPhase}
          keyExtractor={(p, idx) => String(p.phase_number ?? idx)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phaseTitle: { fontWeight: '800', fontSize: 16, color: '#1E3A8A', marginBottom: 6 },
  phaseSummary: { color: '#374151', fontSize: 13, marginBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bullet: { marginRight: 6, color: '#2563EB' },
  subText: { color: '#111827', flex: 1, lineHeight: 20 },
  footer: { padding: 16 },
  closeBtn: { backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  reloadBtn: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
});