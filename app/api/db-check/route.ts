/**
 * Diagnostic endpoint: verifies the Supabase wiring end-to-end.
 *
 * - Returns { ok: true } when env is configured and the Supabase URL
 *   responds to a session lookup (success path includes the no-session
 *   case — which is the v1 default since there's no auth yet).
 * - Returns { ok: false, reason } with a 503 when env isn't set,
 *   so the human can run through docs/setup.md > Supabase to fix it.
 *
 * This route also stands in for T0.2's acceptance criterion ("a server
 * component can query Supabase and render a placeholder result"). It
 * proves the wiring works once the human pastes the env vars in.
 *
 * Cheap to leave around long-term — useful as a smoke test from CI/Vercel.
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/db/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        ok: false,
        reason: "supabase env vars not configured",
        next: "see docs/setup.md > Supabase",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    // getSession() returns { session: null } when there's no logged-in
    // user — the v1 default. It only sets `error` for real problems
    // (bad URL, invalid key, network unreachable). This is the right
    // probe for "is the client wired up correctly?" without depending
    // on auth state.
    const { error } = await supabase.auth.getSession();
    if (error) {
      return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ ok: false, reason }, { status: 500 });
  }
}
