# The Maintenance Tool

A personal AI-powered web app for one user (the maintenance manager at a commercial spa). Replaces the mundane daily work of sourcing parts, finding contractors, and drafting vendor communications.

**Status:** v1 shipped 2026-04-28
**User count:** 1 (the builder)
**Deployment:** Vercel, public deployment at `maintenance-tool-six.vercel.app` (password protection deferred — see polish backlog in `docs/task-breakdown.md`)
**90-day decision:** 2026-07-27 — see `docs/decision-log.md`

---

## What this is

A web-based tool used daily at work by a single maintenance manager at a commercial spa. It handles three core tasks for v1:

1. Sourcing parts — type or photograph a part, get back supplier options with prices and part numbers.
2. Finding contractors and vendors — search local providers for a specific job, capability-check their websites.
3. Drafting vendor outreach — personalized emails into Gmail drafts for review before sending.

Everything else is backlog. See `docs/v2-backlog.md` for the future roadmap.

## What this is NOT

- Not a commercial product yet. No auth, no onboarding, no billing, no multi-tenant.
- Not a replacement for a CMMS. It's a personal productivity tool that may become a CMMS-adjacent product later.
- Not feature-complete. v1 is deliberately narrow. Resist the urge to expand scope.

## For agents working on this repo

Read these files in order before writing any code:

1. `CLAUDE.md` — project rules, conventions, and hard constraints
2. `docs/prd.md` — product requirements document
3. `docs/v1-scope.md` — locked scope for v1 with acceptance criteria
4. `docs/design-guide.md` — visual and UX direction
5. `docs/agent-rules.md` — autonomy boundaries and PR workflow
6. `docs/task-breakdown.md` — current tasks, pick one that isn't claimed

All work happens on feature branches. No direct commits to `main`. All PRs are human-reviewed before merge.

## For the human (me, future me, or anyone inheriting this)

- `QUICKSTART.md` — your next-7-actions guide
- `COWORK_SETUP.md` — how to wire this project into Cowork
- `docs/baseline-metrics.md` — fill this out before you start using the tool, revisit at 30/60/90 days
- `docs/annoyances.md` — dump friction points here as you use the tool, don't act on them for the first 30 days
- `docs/decision-log.md` — record significant decisions as you make them so you don't re-litigate

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (database, storage, eventual auth)
- Claude API via Vercel AI SDK
- Resend for transactional email
- Vercel hosting
- pnpm package manager

## Getting started

See `docs/setup.md` once the repo is initialized. This kickoff package is documentation-only — the repo itself is initialized in the first task.
