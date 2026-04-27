/**
 * Browser-side Supabase client. Runs in Client Components.
 * Uses the anon key — RLS protects data; service-role key never
 * leaves the server.
 */
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";
import { getSupabasePublicEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
