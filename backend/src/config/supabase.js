import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "./env.js";

export const supabase = hasSupabaseConfig()
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

export function createUserSupabaseClient(token) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
