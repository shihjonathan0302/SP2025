// screens/MainScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function MainScreen() {
  // 目標清單（本機 state）
  const [goals, setGoals] = useState([
    { id: '1', title: 'Learn JavaScript', progress: 40, etaDays: 30 },
    { id: '2', title: 'Pass TOEFL', progress: 10, etaDays: 120 },
  ]);

  // 表單 / Modal 狀態
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  // 表單欄位
  const [title, setTitle] = useState('');
  const [etaDays, setEtaDays] = useState('');

  // 開啟「新增」表單
  const openAdd = () => {
    setMode('add');
    setEditingId(null);
    setTitle('');
    setEtaDays('');
    setModalVisible(true);
  };

  // 開啟「編輯」表單
  const openEdit = (goal) => {
    setMode('edit');
    setEditingId(goal.id);
    setTitle(goal.title);
    setEtaDays(String(goal.etaDays ?? ''));
    setModalVisible(true);
  };

  // 儲存（新增或編輯）
  const saveGoal = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('請輸入目標名稱');
      return;
    }
    const eta = etaDays === '' ? undefined : Math.max(0, parseInt(etaDays, 10) || 0);

    if (mode === 'add') {
      const newGoal = {
        id: String(Date.now()),
        title: trimmed,
        progress: 0,
        etaDays: eta ?? 30,
      };
      setGoals((prev) => [newGoal, ...prev]);
    } else if (mode === 'edit' && editingId) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingId ? { ...g, title: trimmed, etaDays: eta ?? g.etaDays } : g
        )
      );
    }

    // 關閉表單
    setModalVisible(false);
    setEditingId(null);
    setTitle('');
    setEtaDays('');
  };

  // 刪除
  const deleteGoal = (id) => {
    Alert.alert('刪除目標', '確定要刪除嗎？', [
      { text: '取消' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => setGoals((prev) => prev.filter((g) => g.id !== id)),
      },
    ]);
  };

  // （可選）快速調整進度：+10%
  const bumpProgress = (id) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: Math.min(100, g.progress + 10) } : g
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          Progress: {item.progress}% • ETA: {item.etaDays} days
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => bumpProgress(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionTxt}>+10%</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
          <Text style={styles.actionTxt}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteGoal(item.id)} style={styles.actionBtn}>
          <Text style={[styles.actionTxt, { color: '#c0392b' }]}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="+ Add Goal" onPress={openAdd} />
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>尚無目標</Text>}
      />

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
              <Button title="Save" onPress={saveGoal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    flexDirection: 'row',
    gap: 10,
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