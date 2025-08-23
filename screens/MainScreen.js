// screens/MainScreen.js

import React, { useState } from 'react';
import {
  View, Text, FlatList, Button, Modal, TextInput,
  StyleSheet, TouchableOpacity, Alert, Platform
} from 'react-native';
import { useGoals, calcProgress } from '../contexts/GoalsContext';

// ==== 雲端 function URL（你的 project-ref 已恢復：baygppmzqzisddezwyrs）====
const FUNC_URL = 'https://baygppmzqzisddezwyrs.functions.supabase.co/breakdown';

// 如果未來你把雲端 function 打開 JWT 驗證（沒用 --no-verify-jwt），把 NEED_AUTH 改為 true，並帶上 anon key。
const NEED_AUTH = false; // 目前我們不需要驗證
const ANON_KEY = '<your-anon-key-if-needed>'; // 需要驗證時才填

// 用雲端 function 產生子目標（之後要換成真 AI 也只要改後端即可） 
async function realAIBreakdown(goalTitle, etaDays) {
  const res = await fetch(FUNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(NEED_AUTH ? { Authorization: `Bearer ${ANON_KEY}` } : {}),
    },
    body: JSON.stringify({ title: goalTitle, etaDays }),
  });

  if (!res.ok) {
    // Fallback：失敗時也能繼續開發
    const now = Date.now();
    return [
      { id: `${now}-1`, title: `Plan for "${goalTitle}"`, isDone: false, order: 1 },
      { id: `${now}-2`, title: 'Weekly schedule', isDone: false, order: 2 },
      { id: `${now}-3`, title: 'First milestone', isDone: false, order: 3 },
    ];
  }
  return res.json();
}

// 主頁面組件
export default function MainScreen({ navigation }) {
  // 從 GoalsContext 中取得目標列表與操作方法
  const { goals, addGoal, removeGoal, updateGoal } = useGoals();

  // 本地狀態：控制新增/編輯目標的彈窗
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' 或 'edit'
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [etaDays, setEtaDays] = useState('');
  const [saving, setSaving] = useState(false); // 存檔中狀態（用於按鈕 loading/禁用）

  // 假 AI：根據 goal title 產生 3~4 個子目標（之後可直接換成呼叫後端 / OpenAI）
  // （保留你的註解，但實作改用雲端 function；真的要回退本地假資料，只要改 saveGoal 裡的呼叫即可）
  async function fakeAIBreakdown(goalTitle) {
    const base = [
      `Research plan for "${goalTitle}"`,
      'Define weekly milestones',
      'Schedule review sessions',
      'Prepare resources / materials',
      'Set up progress tracking routine',
    ];
    const count = 3 + Math.floor(Math.random() * 2); // 3~4 個
    const now = Date.now();
    return Array.from({ length: count }).map((_, i) => ({
      id: `${now}-${i + 1}`,
      title: base[i],
      isDone: false,
      order: i + 1,
    }));
  }

  // 開啟「新增目標」模式
  const openAdd = () => {
    setMode('add'); setEditingId(null); setTitle(''); setEtaDays(''); setModalVisible(true);
  };

  // 開啟「編輯目標」模式，並填入該目標的現有資料
  const openEdit = (goal) => {
    setMode('edit'); setEditingId(goal.id);
    setTitle(goal.title); setEtaDays(String(goal.etaDays ?? ''));
    setModalVisible(true);
  };

  // 儲存目標（新增或更新）
  const saveGoal = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      if (Platform.OS === 'web') alert('請輸入目標名稱'); else Alert.alert('請輸入目標名稱');
      return;
    }
    // 處理 ETA 天數（允許留空）
    const eta = etaDays === '' ? undefined : Math.max(0, parseInt(etaDays, 10) || 0);

    if (mode === 'add') {
      try {
        setSaving(true);
        // Phase 3：用「假 AI」產生 subgoals（之後可替換為 fetch 後端）
        // ⚠️ 改為呼叫雲端 function：如要回退本地假資料，將下一行改回 fakeAIBreakdown(trimmed)
        const subgoals = await realAIBreakdown(trimmed, eta);

        const newGoal = {
          id: String(Date.now()), // 用時間戳當 ID
          title: trimmed,
          etaDays: eta ?? 30,     // 預設 30 天
          subgoals,               // 放進 AI 產生的子目標（來自雲端 function）
        };
        addGoal(newGoal);
      } finally {
        setSaving(false);
      }
    } else if (mode === 'edit' && editingId) {
      // 更新目標
      updateGoal(editingId, (g) => ({ ...g, title: trimmed, etaDays: eta ?? g.etaDays }));
    }

    // 關閉 modal 並重置表單
    setModalVisible(false); setEditingId(null); setTitle(''); setEtaDays('');
  };

  // 刪除目標
  const deleteGoal = (id) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm?.('確定要刪除這個目標嗎？');
      if (!ok) return;
      removeGoal(id);
    } else {
      Alert.alert('刪除目標', '確定要刪除嗎？', [
        { text: '取消' },
        { text: '刪除', style: 'destructive', onPress: () => removeGoal(id) },
      ]);
    }
  };

  // 渲染目標卡片
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} // 點擊進入詳情頁
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        {/* 左側：目標標題與進度 */}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            Progress: {calcProgress(item)}% • ETA: {item.etaDays} days
          </Text>
        </View>
        {/* 右側：編輯與刪除按鈕 */}
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

  return (
    <View style={styles.container}>
      {/* 新增目標按鈕 */}
      <Button title="+ Add Goal" onPress={openAdd} />

      {/* 目標清單 */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>尚無目標</Text>}
      />

      {/* 新增/編輯目標的彈窗表單 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{mode === 'add' ? 'New Goal' : 'Edit Goal'}</Text>
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
              <Button title={saving ? 'Saving...' : 'Save'} onPress={saveGoal} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 樣式設定
const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    flexDirection: 'row',
    gap: 10
  },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { marginTop: 6, color: '#666' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f2f2f2', borderRadius: 8 },
  actionTxt: { fontWeight: '600' },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 10 },
});