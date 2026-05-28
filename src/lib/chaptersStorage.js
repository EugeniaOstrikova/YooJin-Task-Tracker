import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = URL && KEY ? createClient(URL, KEY) : null;

async function getUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

// ── Chapters ──────────────────────────────────────────

export async function loadChapters() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertChapter(chapter) {
  if (!supabase) return;
  const user_id = await getUserId();
  const { error } = await supabase
    .from("chapters")
    .upsert({ ...chapter, user_id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteChapter(id) {
  if (!supabase) return;
  const { error } = await supabase.from("chapters").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Targets ───────────────────────────────────────────

export async function loadTargets(chapterId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("targets")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertTarget(target) {
  if (!supabase) return;
  const user_id = await getUserId();
  const { error } = await supabase
    .from("targets")
    .upsert({ ...target, user_id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteTarget(id) {
  if (!supabase) return;
  const { error } = await supabase.from("targets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Tactics ───────────────────────────────────────────

export async function loadTactics(chapterId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tactics")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("sort");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertTactic(tactic) {
  if (!supabase) return;
  const user_id = await getUserId();
  const { error } = await supabase
    .from("tactics")
    .upsert({ ...tactic, user_id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteTactic(id) {
  if (!supabase) return;
  const { error } = await supabase.from("tactics").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Checkpoints ───────────────────────────────────────

export async function loadCheckpoints(chapterId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("checkpoints")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("target_week");
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertCheckpoint(checkpoint) {
  if (!supabase) return;
  const user_id = await getUserId();
  const { error } = await supabase
    .from("checkpoints")
    .upsert({ ...checkpoint, user_id }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteCheckpoint(id) {
  if (!supabase) return;
  const { error } = await supabase.from("checkpoints").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
