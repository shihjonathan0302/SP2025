// screens/main/MainScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Button, Modal, TextInput,
  StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import ProgressBar from '../../components/ProgressBar';
import GoalDetailModal from '../../components/GoalDetailModal';

export default function MainScreen({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [subgoals, setSubgoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 編輯用 state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [etaDays, setEtaDays] = useState('');
  const [saving, setSaving] = useState(false);

  // 詳細檢視 modal
  const [selected, setSelected] = useState(null);
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  // 🧩 抓 goals 與 subgoals
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data: g } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
      const { data: s } = await supabase.from('subgoals').select('*');
      setGoals(g || []);
      setSubgoals(s || []);
    } catch (e) {
      console.error('[fetchGoals]', e);
      Alert.alert('Error fetching goals');
    } finally {
      setLoading(false);
    }
  };

  // 🧠 開啟詳細檢視：整理 AI 拆解的 phase 結構
  const openDetail = (goal) => {
    const list = subgoals.filter((s) => s.goal_id === goal.id);
    const grouped = list.reduce((acc, cur) => {
      if (!acc[cur.phase_number]) {
        acc[cur.phase_number] = {
          phase_no: cur.phase_number,
          title: cur.phase_name || `Phase ${cur.phase_number}`,
          subgoals: [],
        };
      }
      acc[cur.phase_number].subgoals.push({ title: cur.subgoal_title });
      return acc;
    }, {});
    setPlan(Object.values(grouped));
    setSelected(goal);
  };

  // ✏️ 編輯按鈕
  const openEdit = (goal) => {
    setEditingId(goal.id);
    setTitle(goal.title || '');
    setEtaDays(goal.eta_days != null ? String(goal.eta_days) : '');
    setModalVisible(true);
  };

  // 💾 儲存編輯
  const saveEdit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('請輸入目標名稱');
      return;
    }
    const eta = etaDays === '' ? null : Math.max(0, parseInt(etaDays, 10) || 0);

    try {
      setSaving(true);
      await supabase.from('goals').update({ title: trimmed, eta_days: eta }).eq('id', editingId);
      setGoals((prev) =>
        prev.map((g) => (g.id === editingId ? { ...g, title: trimmed, eta_days: eta } : g))
      );
      setModalVisible(false);
    } catch (e) {
      console.log('[saveEdit] error', e);
      Alert.alert('錯誤', String(e));
    } finally {
      setSaving(false);
    }
  };

  // 🗑 刪除目標
  const deleteGoal = async (id) => {
    const go = async () => {
      try {
        await supabase.from('goals').delete().eq('id', id);
        setGoals((prev) => prev.filter((g) => g.id !== id));
      } catch (e) {
        Alert.alert('刪除失敗', String(e));
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm?.('確定要刪除這個目標嗎？')) await go();
    } else {
      Alert.alert('刪除目標', '確定要刪除嗎？', [
        { text: '取消' },
        { text: '刪除', style: 'destructive', onPress: () => go() },
      ]);
    }
  };

  // 📊 計算子目標完成率
  const calcProgress = (goalId) => {
    const list = subgoals.filter((s) => s.goal_id === goalId);
    if (!list.length) return 0;
    const done = list.filter((s) => s.status === 'done').length;
    return done / list.length;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openDetail(item)} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            ETA: {item.eta_days ?? '-'} days • {item.category || 'Uncategorized'}
          </Text>
          <ProgressBar progress={calcProgress(item.id)} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
            <Text style={styles.actionTxt}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteGoal(item.id)} style={styles.actionBtn}>
            <Text style={[styles.actionTxt, { color: '#c0392b' }]}>Del</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleSubgoalStatusChange = (goalId, subgoalId, newStatus) => {
    setSubgoals((prev) =>
      prev.map((s) =>
        s.id === subgoalId ? { ...s, status: newStatus } : s
      )
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Button title="+ Add Goal" onPress={() => navigation.navigate('CreateGoalFlow')} />
      <FlatList
        data={goals}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        style={{ marginTop: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>尚無目標</Text>}
      />

      {/* 編輯目標 Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            <TextInput
              placeholder="Goal title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="ETA (days)"
              value={etaDays}
              onChangeText={setEtaDays}
              keyboardType="number-pad"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title={saving ? 'Saving...' : 'Save'} onPress={saveEdit} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
      

      {/* 詳細計畫檢視 */}
      <GoalDetailModal
        visible={!!selected}
        title={selected?.title}
        plan={plan}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { marginTop: 6, color: '#666' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f5f5f5', borderRadius: 8 },
  actionTxt: { fontWeight: '600' },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 10 },
});