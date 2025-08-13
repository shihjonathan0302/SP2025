// contexts/GoalsContext.js

// 匯入 React 核心功能
import React, { createContext, useContext, useState } from 'react';

// 建立 Goals Context，用來提供全域目標資料與操作方法
const GoalsContext = createContext(null);

// GoalsProvider：Context 的提供者組件，包裹整個 App 使用
export function GoalsProvider({ children }) {
  // goals 狀態：存放所有目標資料，包含子目標
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
      subgoals: [
        { id: '2-1', title: 'Diagnostic test', isDone: false, order: 1 },
      ],
    },
  ]);

  // 共用的操作（之後前端/後端都能沿用這邏輯）
  // 新增目標：把新目標加到前面
  const addGoal = (goal) => setGoals((prev) => [goal, ...prev]);
  // 刪除目標：過濾掉指定 ID 的目標
  const removeGoal = (goalId) => setGoals((prev) => prev.filter((g) => g.id !== goalId));
  // 更新目標：用 updater 函數修改特定 ID 的目標
  const updateGoal = (goalId, updater) =>
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updater(g) : g)));
  // 提供 Context 的值給子組件使用
  return (
    <GoalsContext.Provider value={{ goals, setGoals, addGoal, removeGoal, updateGoal }}>
      {children}
    </GoalsContext.Provider>
  );
}

// 自訂 Hook，方便其他組件直接使用 goals 與操作方法
export const useGoals = () => useContext(GoalsContext);

// 工具函數：計算單一目標進度（百分比）
// 若沒有子目標，進度為 0；有子目標則取已完成子目標比例
export const calcProgress = (g) => {
  const t = g.subgoals?.length ?? 0;
  const d = g.subgoals?.filter((s) => s.isDone).length ?? 0;
  return t === 0 ? 0 : Math.round((d / t) * 100);
};