/**
 * Centralized read of Supabase env vars. Read lazily (inside accessor
 * functions, never at module load) so the build doesn't blow up before
 * the human has created the Supabase project and pasted values into
 * Vercel / .env.local.
 *
 * If a feature tries to use Supabase before env is configured, it gets
 * a clear actionable error pointing at docs/setup.md.
 */

const SETUP_DOCS_HINT = "See docs/setup.md > Supabase for how to get this value.";

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}. ${SETUP_DOCS_HINT}`);
  }
  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}
