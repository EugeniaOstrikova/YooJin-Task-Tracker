import { useState, useEffect, useCallback } from "react";
import { loadThemes, createTheme, deleteTheme } from "../lib/themesStorage";

export function useThemes() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    loadThemes().then(setThemes).catch(console.error);
  }, []);

  const addTheme = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = themes.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const theme = await createTheme(trimmed);
    setThemes(prev => [...prev, theme].sort((a, b) => a.name.localeCompare(b.name)));
    return theme;
  }, [themes]);

  const removeTheme = useCallback(async (id) => {
    await deleteTheme(id);
    setThemes(prev => prev.filter(t => t.id !== id));
  }, []);

  return { themes, addTheme, removeTheme };
}