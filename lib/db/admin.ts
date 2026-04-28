/**
 * Service-role Supabase client. Bypasses RLS — only use server-side
 * for admin operations (migrations, internal jobs, scheduled tasks).
 *
 * Never import this from a Client Component. The lint rule below would
 * be the right belt-and-suspenders later (eslint-no-restricted-imports
 * in client environments), but for v1 the discipline is documentary.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "./env";

export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const serviceKey = getSupabaseServiceRoleKey();
  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
