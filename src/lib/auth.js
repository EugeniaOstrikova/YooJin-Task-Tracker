import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseAuth = createClient(URL, KEY);

export async function signIn(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabaseAuth.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabaseAuth.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  return supabaseAuth.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}