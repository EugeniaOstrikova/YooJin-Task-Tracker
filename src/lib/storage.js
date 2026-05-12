// Слой данных: Supabase если есть .env, иначе localStorage
// Задача: { id, week, day?, cat, text, important, urgent, deadline, done }

const URL  = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SUPABASE = !!(URL && KEY);
const LOCAL_KEY = "weekly-tracker-tasks-v1";

const headers = USE_SUPABASE
  ? { "apikey": KEY, "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" }
  : {};

// ─── Публичные функции ────────────────────────────────────────────────────────

/** Загрузить все задачи */
export async function loadTasks() {
  if (USE_SUPABASE) {
    const res = await fetch(`${URL}/rest/v1/tasks?select=*&order=created_at.asc`, { headers });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return res.json();
  }
  return _localLoad();
}

/** Добавить / обновить задачи (upsert по id) */
export async function upsertTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;

  if (USE_SUPABASE) {
    const res = await fetch(`${URL}/rest/v1/tasks?on_conflict=id`, {
      method: "POST",
      headers: { ...headers, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify(tasks),
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return res.json();
  }

  const existing = _localLoad();
  const map = Object.fromEntries(existing.map(t => [t.id, t]));
  tasks.forEach(t => { map[t.id] = { ...map[t.id], ...t }; });
  _localSave(Object.values(map));
}

/** Обновить одно поле задачи */
export async function patchTask(id, updates) {
  if (USE_SUPABASE) {
    const res = await fetch(`${URL}/rest/v1/tasks?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return;
  }

  const tasks = _localLoad();
  _localSave(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
}

/** Удалить задачу */
export async function deleteTask(id) {
  if (USE_SUPABASE) {
    await fetch(`${URL}/rest/v1/tasks?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    return;
  }
  _localSave(_localLoad().filter(t => t.id !== id));
}

/** Полная замена (используется при импорте root-файла) */
export async function replaceTasks(tasks) {
  if (USE_SUPABASE) {
    // Удалить всё и вставить заново
    await fetch(`${URL}/rest/v1/tasks?id=neq.""`, { method: "DELETE", headers });
    if (tasks.length > 0) await upsertTasks(tasks);
    return;
  }
  _localSave(tasks);
}

export const isSupabase = USE_SUPABASE;

// ─── localStorage helpers ─────────────────────────────────────────────────────

function _localLoad() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function _localSave(tasks) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
}
