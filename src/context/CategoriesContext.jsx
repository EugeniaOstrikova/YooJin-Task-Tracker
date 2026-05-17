import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadCategories, upsertCategory, deleteCategory } from "../lib/categoriesStorage";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [cats,    setCats]    = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories().then(list => {
      setCats(Object.fromEntries(list.map(c => [c.id, c])));
      setLoading(false);
    }).catch(console.error);
  }, []);

  const saveCategory = useCallback(async (cat) => {
    await upsertCategory(cat);
    setCats(prev => ({ ...prev, [cat.id]: cat }));
  }, []);

  const removeCategory = useCallback(async (id) => {
    await deleteCategory(id);
    setCats(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return (
    <CategoriesContext.Provider value={{ cats, loading, saveCategory, removeCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}