import { useState, useEffect, useCallback } from "react";
import { loadHabits, addHabit, deleteHabit, loadWeekLogs, upsertLog } from "../lib/habitStorage";

export function useHabits(weekId) {
  const [habits, setHabits] = useState([]);
  const [logs,   setLogs]   = useState({}); // { habitId: [bool×7] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [habitList, weekLogs] = await Promise.all([
        loadHabits(),
        loadWeekLogs(weekId),
      ]);
      setHabits(habitList);
      // Собираем карту logs
      const map = {};
      habitList.forEach(h => {
        const log = weekLogs.find(l => l.habit_id === h.id);
        map[h.id] = log?.days ?? [false,false,false,false,false,false,false];
      });
      setLogs(map);
      setLoading(false);
    }
    fetch().catch(console.error);
  }, [weekId]);

  const toggleDay = useCallback(async (habitId, dayIndex) => {
    const current = logs[habitId] ?? [false,false,false,false,false,false,false];
    const updated  = current.map((v, i) => i === dayIndex ? !v : v);
    setLogs(prev => ({ ...prev, [habitId]: updated }));
    await upsertLog(habitId, weekId, updated).catch(console.error);
  }, [logs, weekId]);

  const createHabit = useCallback(async (text) => {
    const habit = { id: `habit_${Date.now()}`, text, active: true };
    await addHabit(habit);
    setHabits(prev => [...prev, habit]);
    setLogs(prev => ({ ...prev, [habit.id]: [false,false,false,false,false,false,false] }));
  }, []);

  const removeHabit = useCallback(async (id) => {
    await deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setLogs(prev => { const n = {...prev}; delete n[id]; return n; });
  }, []);

  return { habits, logs, loading, toggleDay, createHabit, removeHabit };
}