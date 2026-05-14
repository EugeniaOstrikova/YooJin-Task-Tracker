import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_HABITS = "tracker-habits-v1";
const LOCAL_LOGS   = "tracker-habit-logs-v1";

// ── Привычки ──────────────────────────────────────────

export async function loadHabits() {
  if (supabase) {
    const { data, error } = await supabase
      .from("habits").select("*").eq("active", true).order("created_at");
    if (error) throw new Error(error.message);
    return data;
  }
  return JSON.parse(localStorage.getItem(LOCAL_HABITS) ?? "[]");
}

export async function addHabit(habit) {
  if (supabase) {
    const { error } = await supabase.from("habits").insert(habit);
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_HABITS) ?? "[]");
  localStorage.setItem(LOCAL_HABITS, JSON.stringify([...all, habit]));
}

export async function deleteHabit(id) {
  if (supabase) {
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_HABITS) ?? "[]");
  localStorage.setItem(LOCAL_HABITS, JSON.stringify(all.filter(h => h.id !== id)));
}

// ── Логи за неделю ────────────────────────────────────

export async function loadWeekLogs(week) {
  if (supabase) {
    const { data, error } = await supabase
      .from("habit_logs").select("*").eq("week", week);
    if (error) throw new Error(error.message);
    return data;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_LOGS) ?? "[]");
  return all.filter(l => l.week === week);
}

export async function upsertLog(habitId, week, days) {
  if (supabase) {
    const { error } = await supabase.from("habit_logs")
      .upsert({ habit_id: habitId, week, days }, { onConflict: "habit_id,week" });
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_LOGS) ?? "[]");
  const idx = all.findIndex(l => l.habit_id === habitId && l.week === week);
  if (idx >= 0) all[idx] = { habit_id: habitId, week, days };
  else all.push({ habit_id: habitId, week, days });
  localStorage.setItem(LOCAL_LOGS, JSON.stringify(all));
}