import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_KEY = "tracker-week-goals-v1";

export async function loadWeekGoals(week) {
  if (supabase) {
    const { data } = await supabase
      .from("week_goals").select("goals, goals_done").eq("week", week).single();
    return {
      goals:      data?.goals      ?? [],
      goals_done: data?.goals_done ?? [],
    };
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
  return all[week] ?? { goals: [], goals_done: [] };
}

export async function saveWeekGoals(week, goals, goals_done) {
  if (supabase) {
    const { error } = await supabase
      .from("week_goals")
      .upsert({ week, goals, goals_done }, { onConflict: "week" });
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
  all[week] = { goals, goals_done };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}