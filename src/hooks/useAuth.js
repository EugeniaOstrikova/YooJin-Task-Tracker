import { useState, useEffect } from "react";
import { getUser, onAuthChange } from "../lib/auth";

export function useAuth() {
  const [user,    setUser]    = useState(undefined); // undefined = загрузка
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then(u => {
      setUser(u);
      setLoading(false);
    });

    const { data: { subscription } } = onAuthChange(u => {
      setUser(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}