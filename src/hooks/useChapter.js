import { useState, useEffect, useCallback } from "react";
import {
  loadChapters,
  upsertChapter,
  deleteChapter,
  loadTargets,
  upsertTarget,
  deleteTarget,
  loadTactics,
  upsertTactic,
  deleteTactic,
  loadCheckpoints,
  upsertCheckpoint,
  deleteCheckpoint,
} from "../lib/chaptersStorage";

export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters()
      .then((d) => {
        setChapters(d);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveChapter = useCallback(async (chapter) => {
    await upsertChapter(chapter);
    setChapters((prev) => {
      const idx = prev.findIndex((c) => c.id === chapter.id);
      return idx >= 0
        ? prev.map((c) => (c.id === chapter.id ? { ...c, ...chapter } : c))
        : [chapter, ...prev];
    });
  }, []);

  const removeChapter = useCallback(async (id) => {
    await deleteChapter(id);
    setChapters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { chapters, loading, saveChapter, removeChapter };
}

export function useChapterDetail(chapterId) {
  const [targets, setTargets] = useState([]);
  const [tactics, setTactics] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;
    Promise.all([
      loadTargets(chapterId),
      loadTactics(chapterId),
      loadCheckpoints(chapterId),
    ])
      .then(([t, tac, ch]) => {
        setTargets(t);
        setTactics(tac);
        setCheckpoints(ch);
        setLoading(false);
      })
      .catch(console.error);
  }, [chapterId]);

  const saveTarget = useCallback(async (target) => {
    await upsertTarget(target);
    setTargets((prev) => {
      const idx = prev.findIndex((t) => t.id === target.id);
      return idx >= 0
        ? prev.map((t) => (t.id === target.id ? { ...t, ...target } : t))
        : [...prev, target];
    });
  }, []);

  const removeTarget = useCallback(async (id) => {
    await deleteTarget(id);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveTactic = useCallback(async (tactic) => {
    await upsertTactic(tactic);
    setTactics((prev) => {
      const idx = prev.findIndex((t) => t.id === tactic.id);
      return idx >= 0
        ? prev.map((t) => (t.id === tactic.id ? { ...t, ...tactic } : t))
        : [...prev, tactic];
    });
  }, []);

  const removeTactic = useCallback(async (id) => {
    await deleteTactic(id);
    setTactics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveCheckpoint = useCallback(async (cp) => {
    await upsertCheckpoint(cp);
    setCheckpoints((prev) => {
      const idx = prev.findIndex((c) => c.id === cp.id);
      return idx >= 0
        ? prev.map((c) => (c.id === cp.id ? { ...c, ...cp } : c))
        : [...prev, cp];
    });
  }, []);

  const removeCheckpoint = useCallback(async (id) => {
    await deleteCheckpoint(id);
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    targets,
    tactics,
    checkpoints,
    loading,
    saveTarget,
    removeTarget,
    saveTactic,
    removeTactic,
    saveCheckpoint,
    removeCheckpoint,
  };
}
