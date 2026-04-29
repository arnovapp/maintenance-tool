# Decision Log

Record significant decisions as they're made. Future you, future agents, and any future collaborators will thank present you.

Format:

```
## YYYY-MM-DD — Short decision title
**Context:** What was happening, what choice was in front of us
**Decision:** What we chose
**Alternatives considered:** What else was on the table
**Rationale:** Why this, not the others
**Revisit when:** Conditions that should trigger a re-evaluation
```

---

## Project kickoff decisions

## [kickoff date] — Tool is standalone, not inside Arnova

**Context:** Deciding where this tool should live in the product portfolio.
**Decision:** Standalone repo, own Vercel deployment, own subdomain. Not part of Arnova infrastructure in v1.
**Alternatives considered:** Build inside Arnova ecosystem from day one.
**Rationale:** Arnova branding isn't finalized. Coupling to an unfinished brand/infra would slow v1. Standalone lets us move fast and integrate later if the tool proves itself.
**Revisit when:** 90-day productization decision is made. If productizing, reconsider whether this becomes Arnova Maintain or stays independent.

## [kickoff date] — No auth in v1

**Context:** Single user, single deployment. Do we set up auth now?
**Decision:** No auth. Vercel password protection + Supabase row-level security locked to a single service role key. Auth deferred until before a second user touches the tool.
**Alternatives considered:** Minimal Supabase Auth setup now.
**Rationale:** Auth is non-trivial complexity for zero current benefit. Migration later is cheap since we're the only user and can do a hard cutover.
**Revisit when:** A second user is about to get access, or before any productization work.

## [kickoff date] — Agents draft, human approves

**Context:** Multiple agents will be working on the repo concurrently.
**Decision:** All agent work goes to feature branches and PRs. Human reviews and merges. No autonomous merges, no autonomous production deploys, no autonomous external actions.
**Alternatives considered:** Fully autonomous agents with commit access to main.
**Rationale:** The user is still learning how these agents behave on his own projects. Human-in-the-loop is the conservative choice and matches the approval-gate pattern in the app itself.
**Revisit when:** The user has high confidence in specific agent workflows and wants to selectively loosen the gate.

## [kickoff date] — Arnova branding deferred, neutral design for v1

**Context:** Arnova brand isn't finalized; tool is meant to share its visual DNA.
**Decision:** Ship v1 with a clean, neutral, functional design. Rebrand to Arnova tokens in a contained file swap later.
**Alternatives considered:** Wait for Arnova brand to finalize before starting UI work.
**Rationale:** Blocking on an undefined brand would delay v1. The design guide is explicit about isolating brand tokens so the later swap is an afternoon of work.
**Revisit when:** Arnova brand is finalized.

## [kickoff date] — Stack: Next.js + Supabase + Claude API + Vercel

**Context:** User has no stack preference.
**Decision:** Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui; Supabase for data/storage/auth; Claude API via Vercel AI SDK; Resend for email; pnpm; Vercel hosting.
**Alternatives considered:** Remix, SvelteKit, Firebase, self-hosted Postgres, OpenAI API.
**Rationale:** Stack is what the chosen agents (Claude Code, Cowork/Dispatch) handle most smoothly. It's also the stack the user's Arnova work is likely to use, making cross-project consistency easier.
**Revisit when:** A concrete need emerges that the stack can't handle.

## 2026-04-26 — License: proprietary, all rights reserved

**Context:** v1 is a private personal tool that may productize at the 90-day mark.
**Decision:** Proprietary license with explicit "all rights reserved" notice in LICENSE file.
**Alternatives considered:** MIT (too permissive, complicates future commercialization), no LICENSE file (same legal effect but ambiguous).
**Rationale:** Keeps commercialization options open; explicit beats implicit.
**Revisit when:** 90-day productization decision, or if open-sourcing is ever considered.

## 2026-04-26 — Default model: Claude Sonnet 4.6

**Context:** CLAUDE.md needed a concrete default model for Vercel AI SDK calls.
**Decision:** claude-sonnet-4-6 as the default.
**Alternatives considered:** claude-opus-4-7 (overkill and more expensive for v1 search/draft tasks).
**Rationale:** Sonnet 4.6 is the current generation, fast enough for streaming UI, cost-appropriate for v1.
**Revisit when:** A specific task needs more capability or cheaper cost.

## 2026-04-27 — Agents may self-merge in this repo

**Context:** After T0.1–T1.4 had landed via per-PR human merges, the per-PR click was producing friction without commensurate review value: PRs were small, atomic, and Daniel was reading the descriptions but not always opening the GitHub UI for the click. The friction was accumulating at a rate that obscured rather than enabled review.
**Decision:** Agents working on `arnovapp/maintenance-tool` may merge their own PRs to `main` after Daniel's verbal grant on 2026-04-27. Each merge must still be narrated in chat before it happens so Daniel has a chance to intervene. Reverts remain possible per-PR via the GitHub UI.
**Alternatives considered:** (a) keep per-PR human clicks (status quo, accumulating friction); (b) limit self-merge to `chore:` and `docs:` types only (more conservative, but the actual workflow showed feat/fix were equally low-stakes for v1's surface area); (c) add a GitHub MCP connector and merge via API (cleaner long-term, but blocked by the sandbox proxy not allowing api.github.com — Chrome-MCP-driven merges are the available path).
**Rationale:** Small atomic PRs + Daniel reading descriptions in chat preserves the review signal without the per-PR click overhead. The "narrate before merging" requirement keeps Daniel in the loop without requiring action.
**Revisit when:** A PR feels meaningfully riskier than the current cohort (architecture changes, a new dependency category, anything Daniel hasn't seen the pattern of before); or if Daniel notices regressions traceable to a PR he didn't actually read.

## 2026-04-28 — Defer Phase 3 (Gmail OAuth) to v2

**Context:** Daniel sat down to set up the Google Cloud OAuth credentials needed for Phase 3 (T3.1–T3.3, Gmail drafts integration). The Google Cloud Console blocked project creation under both the arnova.app Workspace organization (the user is the owner but the org policy denies `resourcemanager.projects.create`) and "No organization" (also denied — Workspace accounts are forced into their org context). Tooltip confirmed: 'You do not have the required "resourcemanager.projects.create" permission to create projects in this location.'
**Decision:** Defer Phase 3 to v2-backlog. v1 ships with local-only drafts: the /drafts flow generates and stores drafts in the email_draft table; the user reviews/edits in /drafts/[id] and copy-pastes into Gmail to send. The acceptance criterion in v1-scope.md ("Drafts land in the user's Gmail Drafts folder") is the only one v1 won't meet — captured explicitly in the v2-backlog entry.
**Alternatives considered:**

- (a) Use a personal Google account for OAuth credentials — works fine since OAuth client ownership doesn't have to match the user-account email being authorized. Daniel chose to skip rather than introduce a personal-Gmail dependency in v1.
- (b) Escalate Workspace admin and grant Project Creator role on the arnova.app org — also works but requires deeper Workspace policy work that's not v1-shaped.
- (c) Use Resend (already a project dep, never called) for the actual sending side. Rejected: would require building a separate "send via Resend, log to email_draft, follow up via inbox" flow, which is a new feature surface; copy-paste-to-Gmail is honest and minimal.
  **Rationale:** v1's primary value is the part-sourcing + contractor-finding + draft-generation flow. Gmail integration is the polish that saves one copy-paste per email. Holding the rest of v1 hostage to a Workspace permissions tangle would be wrong; deferring is honest.
  **Revisit when:** 90-day productization decision; or if Daniel chooses to set up the Workspace policy override / personal-Google path; or if drafts-volume usage shows the copy-paste step as the top friction in docs/annoyances.md.

## 2026-04-28 — v1 shipped

**Context:** Daniel walked through `docs/v1-scope.md` acceptance criteria with the assistant. Five criteria are fully met, one is explicitly deferred to v2 (Gmail OAuth, see 2026-04-28 entry above), and three are partial: Vercel password protection (decision pending), formal a11y sweep (not run), and `docs/setup.md` Vercel section (not transcribed). The 23 PRs merged today plus the bootstrap commit constitute the foundation, both flows (parts + contractors), all CRUD pages, and the local-only drafts pipeline.
**Decision:** Ship v1 as shipped 2026-04-28. The three partials become a polish backlog in `docs/task-breakdown.md`, prioritized against `docs/annoyances.md` after the usage week. The deferral is logged and intentional.
**Alternatives considered:** Finish the partials before declaring shipped (~1.5 hours of work split across three PRs). Rejected: real usage data is more valuable than polish-without-data, and the partials are bounded enough to fit anywhere in the next 30 days.
**Rationale:** v1's purpose was to get a working tool into Daniel's daily workflow so the 90-day decision has data behind it. Holding "shipped" hostage to polish that the 30-day annoyances log will re-prioritize anyway just delays the start of the clock.
**The 90-day clock starts now.** Decision date: 2026-07-27 (90 days from today). On that date, open `docs/baseline-metrics.md`, fill in the 90-day column, and make the productize / keep-personal / shelve call.
**Revisit when:** 30-day annoyances review (2026-05-28); 60-day check-in; the productization decision date.
