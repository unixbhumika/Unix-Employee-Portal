import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const TABLE = "portal_storage";

export async function loadKey(key, fallback) {
  if (!supabaseConfigured) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  try {
    const { data, error } = await supabase.from(TABLE).select("value").eq("key", key).maybeSingle();
    if (error || !data) return fallback;
    return JSON.parse(data.value);
  } catch (e) {
    return fallback;
  }
}

export async function saveKey(key, value) {
  const json = JSON.stringify(value);
  if (!supabaseConfigured) {
    try {
      localStorage.setItem(key, json);
    } catch (e) {
      /* best-effort */
    }
    return;
  }
  try {
    await supabase.from(TABLE).upsert({ key, value: json, updated_at: new Date().toISOString() });
  } catch (e) {
    /* best-effort */
  }
}
