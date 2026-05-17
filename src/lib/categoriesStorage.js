import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;
const LOCAL_KEY = "tracker-categories-v1";

const DEFAULT_CATS = [
  { id: "korea",   label: "Корея",    dot: "#9B8EC4", bg: "#EDE9FE", color: "#5B21B6", sort: 0 },
  { id: "music",   label: "Музыка",   dot: "#D4956A", bg: "#FEF3C7", color: "#92400E", sort: 1 },
  { id: "finance", label: "Финансы",  dot: "#EA9999", bg: "#FEE2E2", color: "#991B1B", sort: 2 },
  { id: "sport",   label: "Спорт",    dot: "#7BA7BC", bg: "#DBEAFE", color: "#1E40AF", sort: 3 },
  { id: "health",  label: "Здоровье", dot: "#82B5A0", bg: "#D1FAE5", color: "#065F46", sort: 4 },
  { id: "other",   label: "Другое",   dot: "#94A3B8", bg: "#F1F5F9", color: "#475569", sort: 5 },
];

export async function loadCategories() {
  if (supabase) {
    const { data, error } = await supabase
      .from("categories").select("*").order("sort");
    if (error) throw new Error(error.message);
    return data;
  }
  const stored = localStorage.getItem(LOCAL_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CATS;
}

export async function upsertCategory(cat) {
  if (supabase) {
    const { error } = await supabase
      .from("categories").upsert(cat, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  const idx = all.findIndex(c => c.id === cat.id);
  if (idx >= 0) all[idx] = cat; else all.push(cat);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

export async function deleteCategory(id) {
  if (supabase) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all.filter(c => c.id !== id)));
}