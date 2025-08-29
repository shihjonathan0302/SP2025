// services/db.js
import { supabase } from '../supabaseClient';

/**
 * 取得目前登入的使用者 ID（JWT 內的 auth.uid）
 */
export async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

/* -------------------------------------------------------
 * GOALS（目標）
 * -----------------------------------------------------*/

// 你原本的：建立一個 goal（只建 Goal，不建 Subgoals）
export async function createGoalObjectArg({ title, etaDays }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, title, eta_days: etaDays ?? null })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeGoalRow(data);
}

// ✅ 新增別名：createGoal(userId, title, etaDays) 以符合前端呼叫
export async function createGoal(userIdOrUndefined, title, etaDays) {
  const userId = userIdOrUndefined ?? (await getUserId());
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, title, eta_days: etaDays ?? null })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeGoalRow(data);
}

// 你原本的：列出 goals（不含 subgoals）
export async function listGoalsBare() {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeGoalRow);
}

// ✅ 取 goals + subgoals（給 Context 啟動時一次載入）
export async function listGoals() {
  const goals = await listGoalsBare();
  const withSubs = await Promise.all(
    goals.map(async (g) => {
      const subs = await listSubgoals(g.id);
      return { ...g, subgoals: subs };
    })
  );
  return withSubs;
}

// 你原本的：更新某個 goal（欄位名用物件）
export async function updateGoalFields(goalId, { title, etaDays }) {
  const patch = {};
  if (typeof title === 'string') patch.title = title;
  if (typeof etaDays !== 'undefined') patch.eta_days = etaDays;

  const { data, error } = await supabase
    .from('goals')
    .update(patch)
    .eq('id', goalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeGoalRow(data);
}

// ✅ 新增別名：updateGoal(goalId, patch)（對齊前端呼叫）
export async function updateGoal(goalId, patch) {
  // 允許傳 { title, eta_days } 或 { title, etaDays }
  const normalized = {};
  if (typeof patch?.title === 'string') normalized.title = patch.title;
  if (typeof patch?.eta_days !== 'undefined') normalized.eta_days = patch.eta_days;
  if (typeof patch?.etaDays !== 'undefined') normalized.eta_days = patch.etaDays;

  const { data, error } = await supabase
    .from('goals')
    .update(normalized)
    .eq('id', goalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeGoalRow(data);
}

// 你原本的：刪除 goal
export async function removeGoalById(goalId) {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
  return true;
}

// ✅ 新增別名：deleteGoal(goalId)（對齊前端呼叫）
export async function deleteGoal(goalId) {
  return removeGoalById(goalId);
}

/* -------------------------------------------------------
 * SUBGOALS（子目標）
 * -----------------------------------------------------*/

// 讀取某個 goal 的 subgoals
export async function listSubgoals(goalId) {
  const { data, error } = await supabase
    .from('subgoals')
    .select('*')
    .eq('goal_id', goalId)
    .order('order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeSubgoalRow);
}

// 批次新增 subgoals（你原本就有）
export async function insertSubgoals(goalId, items /* [{title,isDone,order}] */) {
  const rows = (items ?? []).map((it) => ({
    goal_id: goalId,
    title: it.title,
    is_done: !!it.isDone,
    order: it.order ?? 1,
  }));

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('subgoals')
    .insert(rows)
    .select('*');

  if (error) throw error;
  return (data ?? []).map(normalizeSubgoalRow);
}

// ✅ 新增：建立單一 subgoal
export async function createSubgoal(goalId, title, order = 1) {
  const { data, error } = await supabase
    .from('subgoals')
    .insert({ goal_id: goalId, title, is_done: false, order })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// 你原本的：切換子目標完成狀態
export async function toggleSubgoalDone(subgoalId, isDone) {
  const { data, error } = await supabase
    .from('subgoals')
    .update({ is_done: !!isDone })
    .eq('id', subgoalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// ✅ 新增：通用更新（可更新 title / is_done / order）
export async function updateSubgoal(subgoalId, patch /* { title?, is_done?, order? } */) {
  const payload = {};
  if (typeof patch?.title === 'string') payload.title = patch.title;
  if (typeof patch?.is_done !== 'undefined') payload.is_done = !!patch.is_done;
  if (typeof patch?.order !== 'undefined') payload.order = patch.order;

  const { data, error } = await supabase
    .from('subgoals')
    .update(payload)
    .eq('id', subgoalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// 你原本的：刪除子目標
export async function removeSubgoal(subgoalId) {
  const { error } = await supabase.from('subgoals').delete().eq('id', subgoalId);
  if (error) throw error;
  return true;
}

// ✅ 新增別名：deleteSubgoal(id)（對齊前端呼叫）
export async function deleteSubgoal(subgoalId) {
  return removeSubgoal(subgoalId);
}

/* -------------------------------------------------------
 * NORMALIZERS：把 DB 欄位命名轉成前端友善命名
 * -----------------------------------------------------*/

function normalizeGoalRow(g) {
  return {
    id: g.id,
    title: g.title,
    etaDays: g.eta_days,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    // 注意：這裡不自帶 subgoals；listGoals() 會另外補上
  };
}

function normalizeSubgoalRow(s) {
  return {
    id: s.id,
    goalId: s.goal_id,
    title: s.title,
    isDone: s.is_done,
    order: s.order,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

/* -------------------------------------------------------
 * 兼容出口（保留你原本名字，避免其他檔案已經引用）
 * -----------------------------------------------------*/

// 舊名別名保留（如果有人 import 這些名字）
export {
  createGoalObjectArg as createGoalWithObjectArg,
  listGoalsBare as listGoalsWithoutSubgoals,
};