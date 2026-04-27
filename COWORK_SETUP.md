# Cowork setup — The Maintenance Tool

Companion to the kickoff bundle. Drop this file into the project folder alongside README.md, CLAUDE.md, and /docs.

---

## Prereqs (do these once, in order)

1. **Claude Desktop** — paid plan, latest version. The Cowork Projects feature requires the March 2026 update or later. First run downloads a ~2 GB VM image.
2. **Claude Code** — installed and authenticated. Cowork orchestrates and writes docs well; for serious coding work it should hand off to Code.
3. **Empty private GitHub repo** — name it `maintenance-tool`. Don't init with a README or .gitignore — leave it completely empty. Cowork's first task (T0.1) sets up the repo structure.
4. **Local project folder** — under your user profile (not a network drive, not a synced cloud drive that fights file locks). Unzip the kickoff bundle into it. The folder should now contain README.md, CLAUDE.md, .github/, /docs, and this file.

---

## Create the Cowork project

1. Claude Desktop → **Cowork** tab → **Projects** in the left sidebar → click **+**.
2. Choose **Use existing folder**. Pick the project folder from step 4 above.
3. Name it: **The Maintenance Tool**.
4. Paste the block from "Instructions to paste" (below) into the Instructions field.
5. Click **Create**.

---

## Connectors to add before the first task

- **GitHub** — required. Without it, Cowork can't push branches or open PRs, and the entire workflow we set up in agent-rules.md falls apart.
- **Vercel** — optional now, useful when T2 deployment tasks start.

Don't bother with a Supabase MCP. Cowork or Claude Code can run the Supabase CLI directly inside the VM when the time comes.

---

## Instructions to paste

Paste this into the Cowork project's **Instructions** field. Keep it short — Cowork reads it on every task.

```
This project is The Maintenance Tool. Always read README.md, CLAUDE.md, and the relevant files in /docs before acting. Follow docs/agent-rules.md exactly: feature branches only, one task per PR, no direct pushes to main, no self-merging. Claim the next unclaimed task in docs/task-breakdown.md before starting it. Stay strictly within v1 scope (docs/v1-scope.md) — out-of-scope ideas get appended to docs/v2-backlog.md, not built. Match the tokens and patterns in docs/design-guide.md. Use AskUserQuestion when anything is ambiguous. Don't take external network actions or destructive file actions without confirming first.
```

---

## Your first prompt

Open the project and paste this as your opening message. Don't skip the orientation step — letting Cowork prove it's read and understood the docs before it touches anything saves a lot of rework.

```
I just created this project. Read every file in this folder — README.md, CLAUDE.md, .github/, and everything under /docs.

Do not start coding yet. Instead:

1. Summarize in one paragraph what this project is and what v1 must do.
2. List the next 3 tasks from docs/task-breakdown.md, in order, that you would tackle.
3. Flag any contradictions, ambiguities, or missing information you noticed in the docs.
4. Confirm you understand the rules in docs/agent-rules.md, especially the PR workflow and the no-self-merge rule.
5. Tell me which connectors are available to you and which ones I still need to set up.

Use AskUserQuestion for anything you're uncertain about. Wait for my approval before starting T0.1.
```

---

## What "good" looks like in Cowork's first response

You're looking for these signals before approving T0.1:

- It correctly identifies v1 as the three task types: parts, contractors, vendor emails.
- The first task it picks is T0.1 (repo init), not something downstream.
- It mentions the PR workflow and the no-self-merge rule unprompted.
- It flags the design tokens being neutral-for-now-rebrandable-later (proves it read the design guide carefully).
- It surfaces at least one ambiguity. (If it doesn't, that's a yellow flag — the docs have ambiguities.)

If all of that checks out, reply: **"Approved. Start T0.1. Open a PR when done. Do not merge."**

If anything is fundamentally wrong, fix the doc in /docs that caused the misunderstanding before continuing. The docs are the source of truth — clarifying things only in chat means future agents (or future you) will repeat the same mistake.

---

## Things that will trip you up

1. **The desktop app must stay open and the computer awake.** If you close Claude or your computer sleeps, the task stops. For long runs, plug in and disable sleep. This is the single most common reason a "24/7 agent" silently dies at hour 3.

2. **Memory is project-scoped.** What Cowork learns inside The Maintenance Tool stays here. It does not leak to your Arnova project (good). It also does not carry from your prior chats unless you point Cowork at those files explicitly.

3. **One continuous thread per project.** You cannot run parallel conversations inside one Cowork project. If you want to explore a tangent without polluting the working thread, use regular Claude chat, not this project.

4. **Cowork is the orchestrator, Claude Code is the engineer.** Expect plans like "draft branch, hand off to Claude Code, review the diff, open PR." If you treat Cowork as a primary code editor, it'll be slower than it should be.

5. **Usage burns faster than chat.** A long Cowork session can chew through your daily allowance. Anthropic runs an off-peak 2x usage window (evenings and weekends) — schedule heavy work for those windows when possible.

6. **Approval gates are real, don't auto-click.** Cowork pauses before destructive operations and external actions. Read what it's about to do, especially in the first week. The pattern of trust is: be skeptical until it's earned.

7. **Work computer constraints.** Installing Claude Desktop and downloading the VM may need IT approval. Production secrets (Supabase service role key, Resend API key) should never live on the work machine — keep them in Vercel env vars and reference from there.

---

## After T0.1 lands

Once Cowork's PR for T0.1 is open and you've reviewed and merged it, the repo exists, the structure is real, and `pnpm install` works locally. From there, you can either:

- Keep driving via Cowork: "Approved. Start T0.2. Open a PR when done."
- Switch to Claude Code in the terminal for any task you want to watch closely.
- Or do both in parallel — just make sure the two agents are claiming different tasks in docs/task-breakdown.md so they don't collide on the same files.

The first two or three PRs are the most important. They set the precedent for how every later PR looks. Be picky early; loosen up once the pattern is locked in.
