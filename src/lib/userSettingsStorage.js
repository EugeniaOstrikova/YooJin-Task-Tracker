import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_KEY = "tracker-user-settings-v1";

export async function loadSettings(userId) {
  if (supabase) {
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data ?? {};
  }
  return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
}

export async function saveSettings(userId, updates) {
  if (supabase) {
    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return;
  }
  const current = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "{}");
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...current, ...updates }));
}