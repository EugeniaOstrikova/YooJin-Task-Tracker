import { useState, useEffect, useCallback } from "react";
import {
  loadGoals, upsertGoal, deleteGoal,
  loadStages, upsertStage, deleteStage,
  loadGroups, upsertGroup, deleteGroup,
} from "../lib/goalsStorage";

export function useGoals() {
  const [goals,   setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals()
      .then(data => { setGoals(data); setLoading(false); })
      .catch(console.error);
  }, []);

  const saveGoal = useCallback(async (goal) => {
    await upsertGoal(goal);
    setGoals(prev => {
      const idx = prev.findIndex(g => g.id === goal.id);
      return idx >= 0
        ? prev.map(g => g.id === goal.id ? { ...g, ...goal } : g)
        : [...prev, goal];
    });
  }, []);

  const removeGoal = useCallback(async (id) => {
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return { goals, loading, saveGoal, removeGoal };
}

export function useGoalStages(goalId) {
  const [stages,  setStages]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goalId) return;
    loadStages(goalId)
      .then(data => { setStages(data); setLoading(false); })
      .catch(console.error);
  }, [goalId]);

  const saveStage = useCallback(async (stage) => {
    await upsertStage(stage);
    setStages(prev => {
      const idx = prev.findIndex(s => s.id === stage.id);
      return idx >= 0
        ? prev.map(s => s.id === stage.id ? { ...s, ...stage } : s)
        : [...prev, stage];
    });
  }, []);

  const removeStage = useCallback(async (id) => {
    await deleteStage(id);
    setStages(prev => prev.filter(s => s.id !== id));
  }, []);

  return { stages, loading, saveStage, removeStage };
}

export function useTaskGroups(stageId) {
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stageId) return;
    loadGroups(stageId)
      .then(data => { setGroups(data); setLoading(false); })
      .catch(console.error);
  }, [stageId]);

  const saveGroup = useCallback(async (group) => {
    await upsertGroup(group);
    setGroups(prev => {
      const idx = prev.findIndex(g => g.id === group.id);
      return idx >= 0
        ? prev.map(g => g.id === group.id ? { ...g, ...group } : g)
        : [...prev, group];
    });
  }, []);

  const removeGroup = useCallback(async (id) => {
    await deleteGroup(id);
    setGroups(prev => prev.filter(g => g.id !== id));
  }, []);

  return { groups, loading, saveGroup, removeGroup };
}