# v1 Scope (Locked)

This document defines what v1 is. Anything not in this document is not v1.

If you're an agent and you find yourself wanting to add something outside this scope: stop, note it in the PR description as a suggestion, and do not build it.

If you're the human and you want to add something outside this scope: add it to `v2-backlog.md` instead and move on. You will want to add things constantly. That's fine. Capture, don't build.

---

## The first-usable milestone

**Definition of first-usable:**

> The user can type a part request or upload a photo of a part/nameplate, and within 15 seconds receive a usable list of supplier options with part numbers, prices, and source URLs.

This is the threshold where the tool starts earning its keep. Everything else in v1 builds on top of this. Ship this first, use it for a week, then move on.

---

## In scope for v1

### 1. Part sourcing

- Text and photo input
- AI-powered search returning 3–5 ranked supplier results
- Display: part number, supplier, price, availability, source URL
- Save to history
- Optionally link to an equipment record (created incidentally)

### 2. Contractor and vendor finding

- Free-text job description input
- Location-aware results (defaults to saved facility location)
- Returns 3–5 local businesses with capability evidence
- Per-result actions: save to vendors, draft outreach email

### 3. Vendor email drafting

- Natural language instruction + context
- Personalized drafts (not templated)
- Pushed to user's Gmail Drafts folder
- Tool maintains its own draft index for status tracking

### 4. Persistent context

- Equipment records, vendor records, part search history, email drafts all stored in Supabase
- Closing and reopening the tool preserves everything
- Past searches can be reopened with full context

### 5. Foundational UX

- Single-input "command bar" home screen
- Top nav: Home / Searches / Equipment / Vendors / Drafts
- Dark mode default, light mode available
- Keyboard-first interactions; `⌘K` / `Ctrl+K` opens main input from anywhere
- Responsive web (works on phone in a pinch, designed for desktop)

### 6. Infrastructure

- Vercel hosting, private subdomain
- Vercel password protection
- Supabase project (database + storage)
- Resend account (email infrastructure, not sending in v1)
- Anthropic API key (server-side only)

---

## Explicitly NOT in v1

These are real, valuable features. They go in `v2-backlog.md`.

- Auth / user accounts / multi-user
- Inventory and stock tracking
- Preventive maintenance schedule
- License and permit tracking
- Paint and finish registry
- Manual and documentation library
- Procedure / SOP library
- Password and code vault
- Architectural drawing library and send-to-contractor
- Work order tracking
- Vendor rating
- Budget tracking
- Warranty tracking
- SDS library
- Meter readings
- Shift notes
- Photo condition history
- Insurance claim support
- Ask-anything chat
- Voice input
- Autonomous email sending
- Mobile app

## Acceptance criteria

> **v1 shipped 2026-04-28.** Five criteria fully met, one deferred to v2 with explicit rationale, three partials logged for the polish phase. The deferral is the only acceptance gap that would block productization without further work; the partials are 30-min-each items that get prioritized against `docs/annoyances.md` after the usage week.

| #   | Criterion                                                        | State          | Notes                                                                                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tool reachable at a private Vercel subdomain from work Chrome    | Partial        | Live at `maintenance-tool-six.vercel.app`. Not password-protected — Vercel Pro offers explicit password protection, free tier offers Vercel-account-based protection. Decision pending: pay, use Vercel auth, or accept "anyone with the URL" for v1.               |
| 2   | Part sourcing — text + photo, under 15s, useful results          | ✓              | T1.1 + T1.2 verified live by Daniel.                                                                                                                                                                                                                                |
| 3   | Contractor finding — local results with real capability evidence | ✓              | T2.2 + T2.3 verified after the schema fix in PR #21.                                                                                                                                                                                                                |
| 4   | Email drafting → drafts in Gmail Drafts folder                   | Deferred to v2 | arnova.app Workspace org policy blocks Google Cloud project creation. See `docs/decision-log.md` 2026-04-28. v1 ships with `/drafts` local-only — generated drafts live in `email_draft`, the user reviews/edits in `/drafts/[id]`, copy-pastes into Gmail to send. |
| 5   | Searches, vendors, equipment persistent                          | ✓              | Supabase-backed; verified through testing of CRUD flows.                                                                                                                                                                                                            |
| 6   | TypeScript strict, no console errors, accessible                 | Mostly ✓       | TS strict on. No known console errors, no formal sweep. Keyboard reachability + focus states + `aria-current` shipped; no formal Lighthouse / axe-core a11y audit yet.                                                                                              |
| 7   | `docs/setup.md` complete enough for clean clone + local run      | Mostly ✓       | Supabase + Anthropic sections proven correct in walkthrough. Vercel-deploy section captured in chat but not yet transcribed into the doc; Resend section TODO is irrelevant for v1 (Resend isn't called).                                                           |
| 8   | `docs/baseline-metrics.md` filled out before daily usage         | ✓              | Committed `c7dd47c` on 2026-04-28.                                                                                                                                                                                                                                  |

The three partials become a small **polish backlog** — see the bottom of `docs/task-breakdown.md`. Each gets prioritized against real-usage friction at the 30-day annoyances review.

## Decision date

The user commits to a go/no-go decision on productization **90 days after first-usable milestone is hit**.

Three possible outcomes on that date:

1. Productize — rebuild with auth, multi-tenancy, onboarding, and pitch to other maintenance managers.
2. Keep as personal tool — it's useful, not productizable, leave it running.
3. Shelve — it didn't deliver, move on.

The decision is made based on `docs/baseline-metrics.md` comparing before/after numbers and qualitative judgment of whether the tool is habitual.
