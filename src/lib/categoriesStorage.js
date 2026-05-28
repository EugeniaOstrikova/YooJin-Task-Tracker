import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_KEY = "tracker-categories-v1";

export async function loadCategories() {
  const DEFAULT_CATS = [
    {
      id: "other",
      label: "other",
      dot: "#94A3B8",
      bg: "#F1F5F9",
      color: "#475569",
      sort: 0,
    },
  ];

  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort");
    if (error) throw new Error(error.message);
    return data?.length ? data : DEFAULT_CATS;
  }
  const stored = localStorage.getItem(LOCAL_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CATS;
}

export async function upsertCategory(cat) {
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("categories")
      .upsert({ ...cat, user_id: user?.id }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  const idx = all.findIndex((c) => c.id === cat.id);
  if (idx >= 0) all[idx] = cat;
  else all.push(cat);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

export async function deleteCategory(id) {
  if (supabase) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify(all.filter((c) => c.id !== id))
  );
}
