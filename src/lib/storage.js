import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabase = !!(URL && KEY);
const supabase = isSupabase ? createClient(URL, KEY) : null;

const LOCAL_KEY = "weekly-tracker-tasks-v1";

export async function loadTasks() {
  if (supabase) {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at");
    if (error) throw new Error(error.message);
    return data;
  }
  return _localLoad();
}

export async function upsertTasks(tasks) {
  if (!tasks?.length) return;
  if (supabase) {
    const { error } = await supabase.from("tasks").upsert(tasks, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }
  const existing = _localLoad();
  const map = Object.fromEntries(existing.map(t => [t.id, t]));
  tasks.forEach(t => { map[t.id] = { ...map[t.id], ...t }; });
  _localSave(Object.values(map));
}

export async function patchTask(id, updates) {
  if (supabase) {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  _localSave(_localLoad().map(t => t.id === id ? { ...t, ...updates } : t));
}

export async function deleteTask(id) {
  if (supabase) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  _localSave(_localLoad().filter(t => t.id !== id));
}

export async function replaceTasks(tasks) {
  if (supabase) {
    await supabase.from("tasks").delete().neq("id", "");
    if (tasks.length) await upsertTasks(tasks);
    return;
  }
  _localSave(tasks);
}

function _localLoad() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"); }
  catch { return []; }
}

function _localSave(tasks) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
}