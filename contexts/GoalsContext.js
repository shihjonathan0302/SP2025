// contexts/GoalsContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 本機儲存的 key
const STORAGE_KEY = 'GOALS_V1';

// 建立 Context
const GoalsContext = createContext(null);

// Provider：包住 App，提供 goals 狀態與操作方法
export function GoalsProvider({ children }) {
  // 初始資料（讀取失敗時作為預設）
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Learn JavaScript',
      etaDays: 30,
      subgoals: [
        { id: '1-1', title: 'Finish a JS basics tutorial', isDone: false, order: 1 },
        { id: '1-2', title: 'Build a small todo app', isDone: true, order: 2 },
      ],
    },
    {
      id: '2',
      title: 'Pass TOEFL',
      etaDays: 120,
      subgoals: [{ id: '2-1', title: 'Diagnostic test', isDone: false, order: 1 }],
    },
  ]);

  // 小遷移：確保每個 goal 都有 subgoals 陣列（避免舊資料沒有這欄位）
  const migrateGoals = (arr) =>
    Array.isArray(arr)
      ? arr.map((g) => ({
          ...g,
          subgoals: Array.isArray(g.subgoals) ? g.subgoals : [],
        }))
      : [];

  // 開機讀：若有本機資料就覆蓋初始值（並做遷移）
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setGoals(migrateGoals(parsed));
        }
      } catch (e) {
        console.warn('Load storage failed', e);
        // 失敗就維持初始 goals，不中斷
      }
    })();
  }, []);

  // 變更即寫：goals 每次改動都寫回本機
  useEffect(() => {
    if (!goals) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals)).catch((e) =>
      console.warn('Save storage failed', e)
    );
  }, [goals]);

  // 共享操作
  const addGoal = (goal) => setGoals((prev) => [goal, ...prev]);
  const removeGoal = (goalId) => setGoals((prev) => prev.filter((g) => g.id !== goalId));
  const updateGoal = (goalId, updater) =>
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updater(g) : g)));

  return (
    <GoalsContext.Provider value={{ goals, setGoals, addGoal, removeGoal, updateGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

// 方便使用的 Hook
export const useGoals = () => useContext(GoalsContext);

// 工具：依子目標完成數計算百分比
export const calcProgress = (g) => {
  const t = g.subgoals?.length ?? 0;
  const d = g.subgoals?.filter((s) => s.isDone).length ?? 0;
  return t === 0 ? 0 : Math.round((d / t) * 100);
};