// contexts/GoalsContext.js
import React, { createContext, useContext, useState } from 'react';

const GoalsContext = createContext(null);

export function GoalsProvider({ children }) {
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

export const useGoals = () => useContext(GoalsContext);

// 工具：進度計算
export const calcProgress = (g) => {
  const t = g.subgoals?.length ?? 0;
  const d = g.subgoals?.filter((s) => s.isDone).length ?? 0;
  return t === 0 ? 0 : Math.round((d / t) * 100);
};