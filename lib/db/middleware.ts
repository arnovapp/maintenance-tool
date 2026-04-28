/**
 * Refreshes the Supabase auth session on every request. v1 has no auth
 * yet (Vercel password protection covers access), but the middleware is
 * wired up now so that when Supabase Auth lands later, sessions Just
 * Work without retrofitting every page.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";
import { getSupabasePublicEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If env isn't configured yet (no Supabase project), short-circuit.
  // This keeps `next dev` working before the human runs through
  // docs/setup.md > Supabase.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Triggers a token refresh if the session is stale.
  await supabase.auth.getUser();

  return supabaseResponse;
}
