# Setup

How to run the project locally and configure each external service. Sections
are filled in as the corresponding tasks land. If a section says "TODO (Tx.y)"
the relevant integration ships in that task.

---

## Prerequisites

- **Node.js 20+** (use `nvm` / `volta` / `fnm` to pin)
- **pnpm 9+** (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)
- **Git for Windows** (Windows users) with Git Credential Manager
- A free **Supabase** account
- A free **Vercel** account
- An **Anthropic API key** (paid; see budgeting note in `docs/prd.md`)
- A **Resend** account (free tier covers v1 — Resend isn't actually called in v1, but the account is set up so v3 sending is one config flip away)

## Local development

```bash
git clone https://github.com/arnovapp/maintenance-tool.git
cd maintenance-tool
pnpm install
cp .env.example .env.local
# fill in values per the "Environment variables" section below
pnpm dev
# → http://localhost:3000
```

Acceptance signals during install:

```bash
pnpm typecheck   # exit 0
pnpm lint        # exit 0
pnpm build       # all routes prerender or compile cleanly
```

## Environment variables

Every variable lives in `.env.local` for development and the Vercel
project's environment-variables panel for production. **Never** commit
`.env.local`. The project's `.gitignore` covers `.env*.local` already.

| Variable                        | Where used                       | How to obtain                                                   | Introduced in |
| ------------------------------- | -------------------------------- | --------------------------------------------------------------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser + server Supabase client | Supabase project → Settings → API → "Project URL"               | T0.2          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server Supabase client | Supabase project → Settings → API → "anon / public" key         | T0.2          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only (admin operations)   | Supabase project → Settings → API → "service_role / secret" key | T0.2          |
| `ANTHROPIC_API_KEY`             | Server-only (AI calls)           | console.anthropic.com → Settings → API Keys                     | T1.1          |
| `RESEND_API_KEY`                | Server-only (email infra)        | resend.com → API Keys                                           | T3.x          |

Server-side variables (no `NEXT_PUBLIC_` prefix) are never sent to the
browser — keep secrets out of any file or component that runs in
`"use client"`.

## Supabase

### Create the project (one-time)

1. Sign in at https://supabase.com → **New project**.
2. Name: `maintenance-tool`. Region: pick the one closest to BC (most likely **US West** for Pacific latency, but any region works for v1).
3. Generate a strong DB password and store it in 1Password / your password manager. You won't need it day-to-day, but you'll need it once for migrations from the CLI.
4. Wait ~2 minutes for the project to spin up.

### Capture the env vars

Once the project is ready:

1. **Settings → API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
3. Copy **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role / secret** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Keep the same three values pasted in your Vercel project's Environment Variables panel under **Production**, **Preview**, **Development** as you set up T0.5.

The browser-side keys (`NEXT_PUBLIC_*`) are safe to expose — they're public by design and protected by Row Level Security on the database side. The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must stay server-side only.

### Verify the wiring

After `.env.local` is filled in:

```bash
pnpm dev
curl http://localhost:3000/api/db-check
# → { "ok": true }   on success
# → { "ok": false, "reason": "supabase env vars not configured", ... }   on missing env
# → { "ok": false, "reason": "<error msg>" }   on a real error (bad URL, wrong key, etc.)
```

This route exists specifically as a smoke test — leave it in place; it's
useful from CI and from the Vercel deployment as well.

### Supabase CLI (optional but recommended)

The CLI is only required when working with migrations and type generation
(T0.3 onward). If you're only running the app, you don't need it.

```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Once installed:
supabase login
supabase link --project-ref <your-project-ref>
# project-ref is in your project URL, e.g. https://app.supabase.com/project/<PROJECT_REF>
```

After linking, `supabase db push`, `supabase db diff`, and
`supabase gen types typescript --linked > lib/db/types.ts` all work.

### Architecture notes

The DB layer in `lib/db/` is intentionally thin:

- `lib/db/client.ts` — browser client (`@supabase/ssr` `createBrowserClient`). Anon key, RLS-bound. Use from Client Components.
- `lib/db/server.ts` — server client (`createServerClient` with `next/headers` cookies). Reads / refreshes the auth cookie. Use from Server Components, Route Handlers, Server Actions.
- `lib/db/admin.ts` — service-role client. Bypasses RLS. Server-only. Use sparingly: scheduled tasks, internal jobs, admin operations.
- `lib/db/middleware.ts` + project-root `middleware.ts` — refreshes the auth session on every request so that when Supabase Auth lands later (post-v1), no per-page retrofit is needed.
- `lib/db/types.ts` — placeholder until T0.3 generates the real schema types via `supabase gen types`.
- `lib/db/env.ts` — single point of read for env vars. Lazy (called inside accessors), so the build doesn't fail before env is configured. Throws clear errors pointing back at this doc when a value is missing.

## Anthropic API (T1.1)

TODO — fill in when T1.1 lands. The key is read server-side only. Streaming via Vercel AI SDK + `@ai-sdk/anthropic`. Default model is `claude-sonnet-4-6` per `CLAUDE.md`.

## Resend (T3.x)

TODO — fill in when the email-drafting flow lands. Even then, v1 only creates Gmail drafts via OAuth (T3.1); Resend isn't called by v1. The account exists so post-v1 transactional sending can switch on without infra setup.

## Vercel deployment (T0.5)

TODO — fill in once T0.5 wires the Vercel project, password protection, and custom subdomain.

## Database migrations (T0.3)

TODO — fill in when the schema migration lands. Plan: hand-written SQL committed under `supabase/migrations/`, applied via `supabase db push` against the linked project. Types are regenerated and committed alongside the migration.

## Husky and pre-commit hooks

`pnpm install` runs `husky` automatically (via the `prepare` script) and
sets up `.husky/_/`. Each commit triggers `pnpm lint-staged`, which runs
Prettier on staged docs/CSS/JSON and Prettier+ESLint on staged TS/TSX/JS/JSX.

If you ever need to bypass the hook for a one-off, `git commit --no-verify`
works — but the only legitimate use so far has been the bootstrap commit
that _introduced_ the hook (where it can't run on itself sanely).

## Running tests

TODO — no test framework yet. Per `docs/agent-rules.md`, tests follow the
value of the code. Likely candidates when actually needed: Vitest + RTL
for components, native `node --test` for pure modules.

## Troubleshooting

- **`Missing environment variable: ...`** in dev → `.env.local` isn't filled in. Walk through the relevant section above.
- **`fatal: not a git repository`** after a clone → make sure you cloned, not downloaded the zip. Git history is required for the agent task workflow.
- **`pnpm: command not found`** → `corepack enable && corepack prepare pnpm@9.15.0 --activate`.
- **Theme doesn't persist across reloads** → check that the browser allows `localStorage` for the origin. Private/incognito mode falls back to dark default by design.
- **Supabase calls 401 unexpectedly** → confirm you copied the **anon** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`, not the service-role key.
