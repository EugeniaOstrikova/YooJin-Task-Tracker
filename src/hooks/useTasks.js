import { useState, useEffect, useCallback } from "react";
import { loadTasks, upsertTasks, patchTask, deleteTask, replaceTasks } from "../lib/storage";

/**
 * Основной хук для работы с задачами.
 * Возвращает tasks[] и функции для CRUD + импорт/экспорт.
 */
export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Загрузка при старте
  useEffect(() => {
    loadTasks()
      .then(data => { setTasks(data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, []);

  // Переключить done
  const toggleDone = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const done         = !task.done;
    const completed_at = done ? new Date().toISOString() : null;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done, completed_at } : t));
    await patchTask(id, { done, completed_at }).catch(console.error);
  }, [tasks]);

  // Импорт задач (добавить / обновить)
  const importTasks = useCallback(async (newTasks) => {
    await upsertTasks(newTasks);
    const all = await loadTasks();
    setTasks(all);
  }, []);

  // Полная замена (restore из root-файла)
  const restoreFromJson = useCallback(async (allTasks) => {
    await replaceTasks(allTasks);
    setTasks(allTasks);
  }, []);

  // Удалить задачу
  const removeTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteTask(id).catch(console.error);
  }, []);

  // Экспорт всех задач в файл tasks.json
  const exportTasks = useCallback(() => {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  const updateTaskLocally = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  return { tasks, loading, error, toggleDone, importTasks, restoreFromJson, removeTask, exportTasks, updateTaskLocally };
}
