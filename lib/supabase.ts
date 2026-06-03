import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const url = process.env.SUPABASE_URL!.trim();
  const key = process.env.SUPABASE_ANON_KEY!.replace(/\s/g, "");
  return createClient(url, key);
}
