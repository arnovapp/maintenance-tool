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
