# CLAUDE.md

This file governs how Claude Code and any other coding agent behaves in this repo. Read it at the start of every session.

## Project context

This is **The Maintenance Tool**, a personal web app for a single user (the maintenance manager at a commercial spa). v1 is intentionally narrow: part sourcing, contractor finding, and vendor email drafting. Everything else is backlog.

The user is not a full-time developer. He directs the work, reviews PRs, and uses the tool daily at work. Clarity and reliability matter more than cleverness.

## Hard rules

1. **No direct commits to `main`.** Every change is a feature branch and a PR. The human reviews and merges.
2. **No scope expansion without approval.** If a task description says "build the part sourcing flow," do not also add inventory tracking, work orders, or any other feature from the v2 backlog. Surface suggestions in the PR description, don't build them.
3. **No new dependencies without explicit approval in the PR description.** Justify every addition. Prefer the existing stack.
4. **No autonomous sending of emails, API calls that cost money, or external writes from the application.** v1 drafts; the user sends. This applies to the *tool being built*, not to internal dev tooling.
5. **No fake data in production code paths.** If a feature can't be demonstrated without real data, add a seed script, don't hardcode placeholders that could ship.
6. **Preserve the approval-gate UX pattern.** Every outward action (email draft, order inquiry, quote request) shows the user what will happen before it happens. The user clicks to confirm.
7. **TypeScript strict mode stays on.** No `any` types without a code comment explaining why.
8. **Accessibility is not optional.** All interactive elements are keyboard-reachable, have visible focus states, and use semantic HTML. The user may be using this one-handed while holding a flashlight.

## Stack conventions

- **Framework:** Next.js 15, App Router, TypeScript strict
- **Styling:** Tailwind CSS. Use `shadcn/ui` for primitives. Don't install component libraries beyond shadcn without approval.
- **Database:** Supabase. Use the typed client (`supabase-js` with generated types). Never write raw SQL in application code — use Supabase query builder or a typed query layer.
- **AI:** Vercel AI SDK (`ai` package) with `@ai-sdk/anthropic`. Stream responses where user-facing. Use Claude Sonnet 4.6 (`claude-sonnet-4-6`) as the default model unless a task specifies otherwise.
- **Email:** Resend. Drafts only in v1 — build toward a "send" capability but gate it behind a human click.
- **Package manager:** pnpm. Commit `pnpm-lock.yaml`. Do not mix in npm or yarn.
- **Environment variables:** `.env.local` for development, Vercel dashboard for production. Never commit secrets. Document every env var in `docs/setup.md`.

## File and folder conventions

```
/app                  — Next.js App Router routes
  /api                — Route handlers for AI, Supabase, Resend
  /(tool)             — Grouped routes for the tool itself
/components           — React components
  /ui                 — shadcn primitives
  /features           — Feature-specific components (parts-search, vendor-finder, etc.)
/lib                  — Shared utilities
  /db                 — Supabase client and typed queries
  /ai                 — AI prompts, schemas, helpers
  /email              — Resend helpers and templates
/types                — Shared TypeScript types
/supabase             — Migrations, seed data, generated types
/docs                 — All project documentation
```

## Code style

- Functional React components only. No class components.
- Server Components by default; `"use client"` only where interactivity requires it.
- Server Actions for mutations where they fit; route handlers where they don't.
- No state management library in v1. Use React state, URL state, and Supabase realtime as needed. Revisit only if pain emerges.
- Format with Prettier, lint with ESLint. Both run pre-commit via Husky + lint-staged.
- Comments explain *why*, not *what*. Code should be self-documenting for the *what*.

## Commit and PR conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Commit messages describe the change in plain language. No "updated stuff."
- Branch names: `feat/part-sourcing`, `fix/photo-upload-size`, `docs/update-prd`
- PR descriptions follow the template in `.github/pull_request_template.md`
- PRs include: what changed, why, how to test, screenshots for UI changes, any risks or follow-ups

## When you're unsure

Default to asking rather than guessing. Add a `QUESTION:` block at the top of the PR description listing open questions for the human. Do not block your own work on them — propose an answer, flag the uncertainty, proceed.

## What success looks like

The user opens the tool at work, types "find drain pump for Hobart CL44e dishwasher," and in under 10 seconds sees a usable list of suppliers with prices and part numbers. Everything else — the equipment database, the vendor relationships, the project tracking — supports that core moment.

Every decision should be checked against: does this make that moment faster, more reliable, or more trustworthy? If not, question whether it belongs in v1.
