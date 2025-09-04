// contexts/GoalsContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
// REMOVE: 不再用本機持久化（避免跟雲端打架）
// import AsyncStorage from '@react-native-async-storage/async-storage';

// 本機儲存的 key（保留註解，但不使用）
// const STORAGE_KEY = 'GOALS_V1';

// ADD: 連 Supabase 與你的 DB 服務層
import { supabase } from '../lib/supabaseClient';
import * as db from '../services/db';

// 建立 Context
const GoalsContext = createContext(null);

// Provider：包住 App，提供 goals 狀態與操作方法
export function GoalsProvider({ children }) {
  // CHANGE: 初始改成空陣列，資料來源改為 DB
  const [goals, setGoals] = useState([]);

  // 小遷移：確保每個 goal 都有 subgoals 陣列（避免舊資料沒有這欄位）
  const migrateGoals = (arr) =>
    Array.isArray(arr)
      ? arr.map((g) => ({
          ...g,
          subgoals: Array.isArray(g.subgoals) ? g.subgoals : [],
        }))
      : [];

  // ADD: 開機載入 + 監聽 auth 切換後重新載入（完全由雲端 DB 讀）
  useEffect(() => {
    const loadFromDb = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGoals([]);
        return;
      }
      const rows = await db.listGoals(user.id); // 你在 services/db.js 實作
      setGoals(migrateGoals(rows));
    };

    // 第一次載入
    loadFromDb();

    // 登入/登出切換時重載
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) setGoals([]);
      else loadFromDb();
    });
    return () => sub.subscription?.unsubscribe?.();
  }, []);

  // REMOVE: 不再做本機持久化
  // useEffect(() => {
  //   if (!goals) return;
  //   AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals)).catch((e) =>
  //     console.warn('Save storage failed', e)
  //   );
  // }, [goals]);

  // 共享操作（前端 state 更新仍保留給畫面即時回饋）
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