// screens/GoalDetailScreen.js

// 匯入 React 與 React Native 元件import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Button,
  TouchableOpacity, Switch, Platform, Alert
} from 'react-native';

// 匯入 GoalsContext，用於讀取與更新目標資料
import { useGoals } from '../contexts/GoalsContext';

export default function GoalDetailScreen({ route, navigation }) {
  const { goalId } = route.params || {};
  const { goals, updateGoal } = useGoals();
  // 找到對應的目標物件
  const goal = useMemo(() => goals.find(g => g.id === goalId), [goals, goalId]);

 // 本地狀態：新子目標的文字輸入
  const [newTitle, setNewTitle] = useState('');

  // 若目標不存在，顯示錯誤訊息
  if (!goal) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#c00' }}>Goal not found.</Text>
      </View>
    );
  }

  // 新增子目標
  const addSubgoal = () => {
    const t = newTitle.trim();
    if (!t) return;
    const sg = { 
      id: `${Date.now()}`, // 用時間戳作為唯一 ID
      title: t, 
      isDone: false, 
      order: (goal.subgoals?.length || 0) + 1 // 排序順序
    };
    updateGoal(goal.id, (g) => ({ ...g, subgoals: [...(g.subgoals || []), sg] }));
    setNewTitle('');
  };

  // 切換子目標完成狀態
  const toggleSubgoal = (sid, isDone) => {
    updateGoal(goal.id, (g) => ({
      ...g,
      subgoals: g.subgoals.map(s => (s.id === sid ? { ...s, isDone } : s)),
    }));
  };

  // 刪除子目標
  const deleteSubgoal = (sid) => {
    const go = () => updateGoal(goal.id, (g) => ({ ...g, subgoals: g.subgoals.filter(s => s.id !== sid) }));
    if (Platform.OS === 'web') {
      if (window.confirm?.('確定要刪除此子目標嗎？')) go();
    } else {
      Alert.alert('刪除子目標', '確定要刪除嗎？', [
        { text: '取消' },
        { text: '刪除', style: 'destructive', onPress: go },
      ]);
    }
  };

  // 渲染單一子目標項目
  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Switch value={item.isDone} onValueChange={(v) => toggleSubgoal(item.id, v)} />
      <Text style={[styles.rowText, item.isDone && { textDecorationLine: 'line-through', color: '#888' }]}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={() => deleteSubgoal(item.id)} style={styles.delBtn}>
        <Text style={{ color: '#c0392b', fontWeight: '700' }}>Del</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 目標標題 */}
      <Text style={styles.title}>{goal.title}</Text>

      {/* 新增子目標輸入區 */}
      <View style={styles.addWrap}>
        <TextInput
          placeholder="Add a subgoal"
          value={newTitle}
          onChangeText={setNewTitle}
          style={styles.input}
        />
        <Button title="Add" onPress={addSubgoal} />
      </View>

      {/* 子目標列表 */}
      <FlatList
        data={goal.subgoals}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ color: '#666' }}>No subgoals yet.</Text>}
      />
    </View>
  );
}

// 樣式設定
const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  addWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  rowText: { flex: 1, fontSize: 16 },
  delBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f2f2f2', borderRadius: 8 },
});