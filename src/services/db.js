// src/services/db.js
import { supabase } from '../lib/supabaseClient';

/* -------------------------------------------------------
 * 基本工具：登入使用者
 * -----------------------------------------------------*/
export async function getUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

// 小工具：Date → 'YYYY-MM-DD'
function toYMD(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  if (!(d instanceof Date)) d = new Date(d);
  return d.toISOString().slice(0, 10);
}

/* -------------------------------------------------------
 * GOALS（目標）
 * -----------------------------------------------------*/

// 建立一個 goal（物件參數版）
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

// 別名 createGoal(userId?, title, etaDays?)
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

// 讀 goals（不含 subgoals）
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

// 讀 goals + subgoals（Context 用）
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

// 更新 goal（簡單版）
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

// 別名 updateGoal(goalId, patch)
export async function updateGoal(goalId, patch) {
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

// 刪除 goal（會 cascade subgoals）
export async function removeGoalById(goalId) {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
  return true;
}

export async function deleteGoal(goalId) {
  return removeGoalById(goalId);
}

/* -------------------------------------------------------
 * SUBGOALS（子目標） - 支援 phase + due_date
 * -----------------------------------------------------*/

// 讀取並群組成 phases（GoalDetail 用）
export async function getGoalPhases(goalId) {
  const rows = await listSubgoals(goalId);
  const map = new Map();

  for (const r of rows) {
    const key = r.phase_number ?? 0;
    if (!map.has(key)) {
      map.set(key, {
        phase_number: key,
        title: r.phase_name || `Phase ${key}`,
        summary: r.phase_summary || '',
        subgoals: [],
      });
    }
    map.get(key).subgoals.push(r);
  }

  return Array.from(map.values());
}

// 讀取某個 goal 的所有 subgoals
export async function listSubgoals(goalId) {
  const { data, error } = await supabase
    .from('subgoals')
    .select('*')
    .eq('goal_id', goalId)
    .order('phase_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeSubgoalRow);
}

// ⭐ 讀取「某一天」所有 subgoals（給 Calendar / Dashboard 用）
//   這個吃 Date 或 string 都可以
export async function listSubgoalsForDate(date) {
  const ymd = toYMD(date);
  if (!ymd) throw new Error('Invalid date for listSubgoalsForDate');

  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');

  // 一起拉出 goals 的 title / category
  const { data, error } = await supabase
    .from('subgoals')
    .select(`
      *,
      goals!inner (
        title,
        category,
        user_id
      )
    `)
    .eq('due_date', ymd)
    .eq('goals.user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeSubgoalRow);
}

// 批次新增 subgoals（for AI Plan）
export async function insertSubgoals(goalId, items) {
  if (!items?.length) return [];

  const rows = items.map((it) => ({
    goal_id: goalId,
    phase_number: it.phase_number ?? 1,
    phase_name: it.phase_name ?? 'Phase 1',
    subgoal_title: it.subgoal_title ?? it.title ?? 'Untitled',
    subgoal_description: it.subgoal_description ?? it.title ?? '',
    status: it.status ?? 'pending',
    due_date: it.due_date ? toYMD(it.due_date) : null,
  }));

  const { data, error } = await supabase
    .from('subgoals')
    .insert(rows)
    .select('*');

  if (error) throw error;
  return (data ?? []).map(normalizeSubgoalRow);
}

// 建立單一 subgoal（for 手動新增）
export async function createSubgoal(
  goalId,
  title,
  order = 1,
  phase_number = 1,
  dueDate = null
) {
  const { data, error } = await supabase
    .from('subgoals')
    .insert({
      goal_id: goalId,
      subgoal_title: title,
      subgoal_description: title,
      phase_number,
      phase_name: `Phase ${phase_number}`,
      status: 'pending',
      due_date: dueDate ? toYMD(dueDate) : null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// 切換完成狀態
export async function toggleSubgoalDone(subgoalId, isDone) {
  const newStatus = isDone ? 'done' : 'pending';
  const { data, error } = await supabase
    .from('subgoals')
    .update({ status: newStatus })
    .eq('id', subgoalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// 通用更新
export async function updateSubgoal(subgoalId, patch) {
  const payload = {};
  if (typeof patch?.subgoal_title === 'string') payload.subgoal_title = patch.subgoal_title;
  if (typeof patch?.status === 'string') payload.status = patch.status;
  if (typeof patch?.phase_number !== 'undefined') payload.phase_number = patch.phase_number;
  if (typeof patch?.subgoal_description === 'string')
    payload.subgoal_description = patch.subgoal_description;
  if (typeof patch?.due_date !== 'undefined')
    payload.due_date = patch.due_date ? toYMD(patch.due_date) : null;

  const { data, error } = await supabase
    .from('subgoals')
    .update(payload)
    .eq('id', subgoalId)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSubgoalRow(data);
}

// 刪除子目標
export async function removeSubgoal(subgoalId) {
  const { error } = await supabase.from('subgoals').delete().eq('id', subgoalId);
  if (error) throw error;
  return true;
}

export async function deleteSubgoal(subgoalId) {
  return removeSubgoal(subgoalId);
}

/* -------------------------------------------------------
 * NORMALIZERS
 * -----------------------------------------------------*/

function normalizeGoalRow(g) {
  return {
    id: g.id,
    title: g.title,
    etaDays: g.eta_days,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
}

function normalizeSubgoalRow(s) {
  // s 可能是單純 subgoals row，也可能包含 join 回來的 goals
  return {
    id: s.id,
    goal_id: s.goal_id,
    phase_number: s.phase_number ?? null,
    phase_name: s.phase_name ?? null,

    subgoal_title: s.subgoal_title ?? s.title ?? '',
    subgoal_description: s.subgoal_description ?? s.title ?? '',
    status: s.status ?? (s.is_done ? 'done' : 'pending'),

    due_date: s.due_date ?? null,

    goal_title: s.goals?.title ?? null,
    goal_category: s.goals?.category ?? null,

    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

/* -------------------------------------------------------
 * 兼容出口
 * -----------------------------------------------------*/
export {
  createGoalObjectArg as createGoalWithObjectArg,
  listGoalsBare as listGoalsWithoutSubgoals,
};