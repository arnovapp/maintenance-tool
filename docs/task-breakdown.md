# Task Breakdown

This is the ordered list of tasks to build v1. Agents pick tasks from the top of the unclaimed list.

**Claim format:** Add `@claimed: <agent-id> <ISO-timestamp>` under the task when you start. Remove the claim and mark `@done: <PR-url>` when the PR merges.

---

## Phase 0: Project setup

### T0.1 — Initialize repo

@claimed: cowork-claude 2026-04-27T06:53:56Z

- Create Next.js 15 app with App Router and TypeScript strict mode
- Configure Tailwind CSS
- Install and initialize shadcn/ui with a neutral base palette
- Set up ESLint, Prettier, Husky, lint-staged
- Configure `tsconfig.json` with strict settings and path aliases (`@/*`)
- Create folder structure per `CLAUDE.md`
- Add `.gitignore`, `.env.example`, `LICENSE` (proprietary, all rights reserved)
- First commit: `chore: initialize Next.js project`

**Acceptance:** `pnpm dev` runs a blank page with no errors. `pnpm lint` and `pnpm typecheck` both pass.

### T0.2 — Set up Supabase

@claimed: cowork-claude 2026-04-27T07:10:33Z

- Create a new Supabase project (human does this, agent documents the process)
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Configure client helpers for server and browser components
- Set up `supabase/migrations/` directory
- Generate types from the initial (empty) schema
- Document env vars in `docs/setup.md`

**Acceptance:** A server component can query Supabase and render a placeholder result without errors.

### T0.3 — Schema v1 migration

@claimed: cowork-claude 2026-04-27T07:14:21Z
Create the initial tables per `docs/prd.md` section 5:

```sql
-- equipment
-- id, name, type, manufacturer, model, serial, install_date, location, notes, created_at, updated_at

-- vendor
-- id, name, type (supplier/contractor/service), email, phone, website, specialty, notes, created_at, updated_at

-- part_search
-- id, input_text, input_image_url, results (jsonb), chosen_result_id, equipment_id (fk nullable), created_at

-- email_draft
-- id, recipient_email, subject, body, attachments (jsonb), vendor_id (fk nullable), context_type, context_id, status (draft/sent/ignored), gmail_draft_id, created_at, updated_at
```

- Use Supabase migration tooling (`supabase db diff` or hand-written SQL)
- Generate TypeScript types from the new schema
- Commit both migration and generated types
- Add seed data script with a handful of realistic example rows for development

**Acceptance:** Migration applies cleanly. Types are generated and compile. Seed script populates dev environment.

### T0.4 — App shell and navigation

@claimed: cowork-claude 2026-04-27T07:05:55Z

- Implement persistent top nav per `docs/design-guide.md`
- Routes: `/` (home), `/searches`, `/equipment`, `/vendors`, `/drafts`
- Each route shows a placeholder until its real implementation lands
- Configure dark mode default with light mode toggle
- Implement `⌘K` / `Ctrl+K` to focus the home command bar from anywhere

**Acceptance:** All routes load without errors. Top nav is keyboard-accessible. Dark mode is default. `⌘K` focuses the home input.

### T0.5 — Vercel deploy and password protection

- Connect repo to Vercel
- Configure preview deployments per branch
- Set production branch to `main`
- Enable Vercel password protection
- Configure custom subdomain (human provides domain)
- Document deployment process in `docs/setup.md`

**Acceptance:** Pushing to a feature branch produces a preview URL. Production URL is password-protected. Human can reach the placeholder app from his work computer.

---

## Phase 1: Part sourcing (the first-usable milestone)

### T1.1 — Part sourcing: text input flow

@claimed: cowork-claude 2026-04-28T04:57:00Z

- Build the home page command bar
- Submit hits `/api/search/parts` with text input
- API uses Vercel AI SDK with Claude Sonnet 4.5 to generate a structured search response
- Response schema enforced via Zod
- Saves the search to `part_search` table
- Streams results back to UI as they arrive

**Acceptance:** Typing "drain pump for Hobart CL44e" returns at least 3 results in under 15 seconds. Results are persisted to Supabase.

### T1.2 — Part sourcing: photo input flow

@claimed: cowork-claude 2026-04-28T13:18:47Z

- Add photo upload to the command bar (drag-drop, paste, or click)
- Upload to Supabase Storage
- API receives image URL, uses Claude vision to extract part / model / nameplate info
- Feeds extracted info into the same search pipeline as T1.1
- Saves the original image with the search record

**Acceptance:** A photo of a nameplate returns results referencing the extracted model number.

### T1.3 — Part sourcing: results UI

- Clean table display of results
- Monospace for part numbers
- Confidence level as a subtle badge per row
- Source URL opens in new tab
- Per-row action: "save to equipment" (prompts to select or create an equipment record)
- Copy-to-clipboard for part number on click

**Acceptance:** Results are scannable in under 5 seconds. Clicking a source URL opens the supplier page. Saving a result creates or updates an equipment record.

### T1.4 — Part sourcing: history

@claimed: cowork-claude 2026-04-28T06:17:23Z

- `/searches` page showing all past part searches
- Each row: query summary, date, result count, linked equipment (if any)
- Click a row to reopen the search view with its results
- Simple text search over past queries

**Acceptance:** Past searches are findable. Clicking a past search restores its full context.

### FIRST-USABLE CHECKPOINT

After T1.1–T1.4 merge, **pause all other work**. The human uses the tool for 1 week on real tasks. During that week:

- Fill out `docs/baseline-metrics.md`
- Log friction points in `docs/annoyances.md`
- Do not build new features

After the week, review the annoyances log together. Fix the top 3 frictions. Then resume Phase 2.

---

## Phase 2: Contractor and vendor finding

### T2.1 — Vendor data model UI

@claimed: cowork-claude 2026-04-28T13:04:49Z

- `/vendors` page listing all vendors
- Create / edit / delete a vendor
- Search and filter
- Tag with type (supplier / contractor / service) and specialty

### T2.2 — Contractor finding: search flow

@claimed: cowork-claude 2026-04-29T02:02:53Z

- New input mode: "find me a contractor/business for..."
- Location-aware search (user's saved facility location)
- Returns 3–5 local results with: name, website, contact, capability evidence, distance
- Saves the search to `part_search` (reusing the table) with a `search_type` discriminator

### T2.3 — Contractor finding: save and outreach

@claimed: cowork-claude 2026-04-29T02:48:43Z

- Per-result action: "save to vendors" (creates vendor record)
- Per-result action: "draft outreach email" (generates email and saves to `email_draft`, pushes to Gmail drafts)

---

## Phase 3: Vendor outreach drafting

> **Phase 3 deferred to v2 (2026-04-28).** Gmail OAuth requires creating a
> Google Cloud project, and the arnova.app Workspace organization policy
> blocks project creation for `daniel@arnova.app` even at the org-owner
> level. v1 ships with local-only drafts (the /drafts flow under T2.3) —
> copy-paste into Gmail to send. See `docs/decision-log.md` entry
> 2026-04-28 — "Defer Phase 3 (Gmail OAuth) to v2" for context. Picking
> this back up requires either (a) a personal Google account separate from
> arnova.app, or (b) modifying the Workspace org policy to allow
> project-creation. Both are tractable; neither is blocking v1.

### T3.1 — Gmail OAuth integration

- User connects their Google account via OAuth
- Store tokens securely (Supabase)
- Minimal scope: `gmail.compose` only (drafts, not send)
- Refresh token handling

### T3.2 — Email draft composer

- Natural language instruction input
- Context selector (attach a part search result, a vendor, a project)
- AI generates subject, body, suggested attachments
- Preview before pushing to Gmail drafts
- Push creates a Gmail draft in the user's account; tool stores the Gmail draft ID

### T3.3 — Drafts inbox

- `/drafts` page listing all email drafts (tool-side view)
- Links to the corresponding Gmail draft
- Status tracking: draft / sent / ignored (user marks status; future: webhook from Gmail)

---

## Phase 4: Polish and acceptance

### T4.1 — Equipment browse page

@claimed: cowork-claude 2026-04-28T13:12:20Z

- `/equipment` listing all equipment with basic CRUD
- Link from any search result or email draft that references it

### T4.2 — Navigation and shell polish

- Persistent top nav per design guide (final pass)
- Keyboard shortcuts doc overlay (`?`)
- Consistent loading and error states across pages

### T4.3 — Acceptance checklist

- Walk through every bullet in `docs/v1-scope.md` acceptance section
- Fix anything that doesn't meet the bar
- Mark v1 complete

---

## Backlog (unclaimed, not yet scheduled)

These are tasks mentioned in v1 scope that don't fit cleanly into the phases above. Schedule as needed.

- Accessibility audit and fixes
- Performance audit (Lighthouse, Core Web Vitals)
- Error monitoring setup (Sentry or similar)
- Analytics (privacy-respecting, Plausible or similar) — optional for v1
- Dark/light mode toggle polish
- `docs/setup.md` comprehensive pass
- Onboarding of the user's own data (import existing vendor list, etc.) — out of scope unless user requests
