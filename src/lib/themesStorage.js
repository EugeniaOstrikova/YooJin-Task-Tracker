import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_KEY = "tracker-themes-v1";

export async function loadThemes() {
  if (supabase) {
    const { data, error } = await supabase
      .from("themes").select("*").order("name");
    if (error) throw new Error(error.message);
    return data;
  }
  return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
}

export async function createTheme(name) {
  const theme = { id: `theme_${Date.now()}`, name };
  if (supabase) {
    const { error } = await supabase.from("themes").insert(theme);
    if (error) throw new Error(error.message);
    return theme;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...all, theme]));
  return theme;
}

export async function deleteTheme(id) {
  if (supabase) {
    const { error } = await supabase.from("themes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all.filter(t => t.id !== id)));
}