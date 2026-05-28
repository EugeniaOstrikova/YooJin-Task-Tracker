import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;

// ── Goals ─────────────────────────────────────────────

export async function loadGoals() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertGoal(goal) {
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("goals")
    .upsert({ ...goal, user_id: user?.id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteGoal(id) {
  if (!supabase) return;
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Stages ────────────────────────────────────────────

export async function loadStages(goalId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("goal_stages")
    .select("*")
    .eq("goal_id", goalId)
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertStage(stage) {
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("goal_stages")
    .upsert({ ...stage, user_id: user?.id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteStage(id) {
  if (!supabase) return;
  const { error } = await supabase.from("goal_stages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Task Groups ───────────────────────────────────────

export async function loadGroups(stageId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("task_groups")
    .select("*")
    .eq("stage_id", stageId)
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertGroup(group) {
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("task_groups")
    .upsert({ ...group, user_id: user?.id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteGroup(id) {
  if (!supabase) return;
  const { error } = await supabase.from("task_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
