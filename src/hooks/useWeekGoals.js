import { useState, useEffect, useCallback } from "react";
import { loadWeekGoals, saveWeekGoals } from "../lib/weekGoalsStorage";

export function useWeekGoals(weekId) {
  const [goals, setGoals]     = useState(["", "", ""]);
  const [done,  setDone]      = useState([false, false, false]);

  useEffect(() => {
    loadWeekGoals(weekId).then(({ goals: g, goals_done: d }) => {
      setGoals([...g,     "", "", ""].slice(0, 3));
      setDone( [...d, false, false, false].slice(0, 3));
    }).catch(console.error);
  }, [weekId]);

  const save = useCallback(async (newGoals, newDone) => {
    const toSaveGoals = newGoals.map(g => g.trim());
    await saveWeekGoals(weekId, toSaveGoals, newDone).catch(console.error);
  }, [weekId]);

  const updateGoal = useCallback((index, text) => {
    const updated = goals.map((g, i) => i === index ? text : g);
    setGoals(updated);
    save(updated, done);
  }, [goals, done, save]);

  const toggleDone = useCallback((index) => {
    const updated = done.map((d, i) => i === index ? !d : d);
    setDone(updated);
    save(goals, updated);
  }, [goals, done, save]);

  return { goals, done, updateGoal, toggleDone };
}