/**
 * Server-side Supabase client. For Server Components, Route Handlers,
 * and Server Actions. Reads/writes the auth cookie via Next's cookies()
 * API so session refresh works across full-page loads.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";
import { getSupabasePublicEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll() is a no-op when called from a Server Component
          // (cookies are read-only there). The session will still be
          // refreshed by the middleware client on the next request.
        }
      },
    },
  });
}
