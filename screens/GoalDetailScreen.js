// screens/GoalDetailScreen.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Button,
  TouchableOpacity, Switch, Platform, Alert
} from 'react-native';
import { useGoals } from '../contexts/GoalsContext';

// ADD: DB 服務層
import * as db from '../services/db';

export default function GoalDetailScreen({ route }) {
  const { goalId } = route.params || {};
  const { goals, updateGoal } = useGoals();

  // 找到對應的目標物件
  const goal = useMemo(() => goals.find((g) => g.id === goalId), [goals, goalId]);

  const [newTitle, setNewTitle] = useState('');

  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#c00' }}>Goal not found.</Text>
      </View>
    );
  }

  // CHANGE: 新增子目標 → 先寫 DB，再更新前端 state
  const addSubgoal = async () => {
    const t = newTitle.trim();
    if (!t) return;

    // 建議由 DB 產出 id（uuid），這裡回傳 created row
    const order = (goal.subgoals?.length || 0) + 1;
    const created = await db.createSubgoal(goal.id, t, order);

    const sg = {
      id: created.id,
      title: t,
      isDone: false,
      order
    };

    updateGoal(goal.id, (g) => ({
      ...g,
      subgoals: [...(g.subgoals || []), sg],
    }));
    setNewTitle('');
  };

  // CHANGE: 切換完成 → 打 DB
  const toggleSubgoal = async (sid, isDone) => {
    await db.updateSubgoal(sid, { is_done: isDone });
    updateGoal(goal.id, (g) => ({
      ...g,
      subgoals: (g.subgoals || []).map((s) => (s.id === sid ? { ...s, isDone } : s)),
    }));
  };

  // CHANGE: 刪除子目標 → 打 DB
  const deleteSubgoal = async (sid) => {
    const go = async () => {
      await db.deleteSubgoal(sid);
      updateGoal(goal.id, (g) => ({
        ...g,
        subgoals: (g.subgoals || []).filter((s) => s.id !== sid),
      }));
    };

    if (Platform.OS === 'web') {
      if (window.confirm?.('確定要刪除此子目標嗎？')) await go();
    } else {
      Alert.alert('刪除子目標', '確定要刪除嗎？', [
        { text: '取消' },
        { text: '刪除', style: 'destructive', onPress: () => { go(); } },
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Switch value={!!item.isDone} onValueChange={(v) => toggleSubgoal(item.id, v)} />
      <Text
        style={[
          styles.rowText,
          item.isDone && { textDecorationLine: 'line-through', color: '#888' },
        ]}
      >
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => deleteSubgoal(item.id)} style={styles.delBtn}>
        <Text style={{ color: '#c0392b', fontWeight: '700' }}>Del</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{goal.title}</Text>

      <View style={styles.addWrap}>
        <TextInput
          placeholder="Add a subgoal"
          value={newTitle}
          onChangeText={setNewTitle}
          style={styles.input}
        />
        <Button title="Add" onPress={addSubgoal} />
      </View>

      <FlatList
        data={goal.subgoals ?? []}               
        keyExtractor={(s) => String(s.id)}        
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ color: '#666' }}>No subgoals yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  addWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  rowText: { flex: 1, fontSize: 16 },
  delBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f2f2f2', borderRadius: 8 },
});