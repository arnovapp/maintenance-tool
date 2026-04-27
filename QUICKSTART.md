# Quickstart — what to do with this bundle

You asked for everything you'd need to start building this with Claude Code, Cowork/Dispatch, Chrome control, and design agents. This is that bundle.

It's documentation only. No code yet. The code gets built by the agents against this documentation.

---

## What's in here

```
maintenance-tool-kickoff/
├── README.md                      — repo overview, orients any agent or human
├── CLAUDE.md                      — project rules, read first by Claude Code every session
├── QUICKSTART.md                  — this file
├── COWORK_SETUP.md                — how to wire this project into Cowork
├── .github/
│   └── pull_request_template.md   — enforces the PR workflow
└── docs/
    ├── prd.md                     — product requirements doc
    ├── v1-scope.md                — locked v1 scope with acceptance criteria
    ├── v2-backlog.md              — everything we brainstormed, deferred
    ├── design-guide.md            — visual and UX direction
    ├── agent-rules.md             — autonomy boundaries, PR workflow, multi-agent coordination
    ├── task-breakdown.md          — ordered task list agents pick from
    ├── baseline-metrics.md        — fill out before using the tool (important)
    ├── annoyances.md              — dump frictions here during use, don't fix for 30 days
    ├── decision-log.md            — significant decisions recorded
    └── setup.md                   — how to run the project (fills in as code is built)
```

---

## Your next 7 actions, in order

1. **Create a new private GitHub repo.** Name it something like `maintenance-tool`. Don't initialize it with a README or .gitignore — we'll push this bundle in.

2. **Unzip this bundle into a new folder, `cd` in, and:**
   ```
   git init
   git add .
   git commit -m "chore: project kickoff documentation"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Fill out `docs/baseline-metrics.md` this week.** Do not skip this. If you skip it, you lose the ability to answer "is this tool actually working" at 90 days. Track a normal week of your current part-sourcing / contractor-research / email-drafting time. Even rough tallies are fine.

4. **Stand up the Cowork project.** Follow `COWORK_SETUP.md`. Paste in the project instructions, run the orientation prompt, confirm Cowork understands the docs before approving T0.1.

5. **Optionally set up Claude Code in parallel.** Open the project folder in Claude Code (it will read `CLAUDE.md` automatically). For phase 0 you probably want either Cowork or Claude Code driving — not both — since the bootstrap tasks depend on each other. Once the repo is initialized and the database is set up (after T0.3), you can parallelize.

6. **Review every PR.** Actually read them. The agent rules require human approval for every merge. This is not a rubber-stamp step — it's how you catch scope drift and reinforce the pattern.

7. **Hit the first-usable milestone, then pause.** The task breakdown has a hard checkpoint after the part-sourcing flow ships. Actually pause. Actually use the tool for a week. Actually fill in the annoyances log. This is the most important week of the project and the one most likely to get skipped.

---

## Things to resist

**You will want to rebrand to Arnova.** The design guide explicitly isolates brand tokens so the rebrand is a file swap later. Don't block v1 on a brand that isn't finalized.

**You will want to add features from the v2 backlog.** The backlog exists so you don't have to hold these in your head. Every time you think "oh, it should also do X," open `docs/v2-backlog.md`, confirm X is already there, close the file.

**You will want to let agents run autonomously to main.** The approval gate is annoying in week one and load-bearing in month three. Keep it.

**You will want to optimize and polish before the tool has real usage data.** Don't. Ship the ugly version, use it, then polish the parts that actually matter based on your annoyances log.

---

## If something goes wrong

- **Agent produces code that doesn't match the design guide:** reject the PR, ask for revision, reference the specific section of `docs/design-guide.md` that was violated
- **Agent tries to expand scope:** reject the PR, ask them to move the out-of-scope part to `docs/v2-backlog.md` and redo
- **Two agents are working on the same thing:** they should be claiming tasks in `docs/task-breakdown.md`. If they're not, enforce it — close the later PR, ask that agent to claim a different task
- **Something is ambiguous in the docs:** that's on the doc. Update it in a `docs: ...` PR, then continue

---

## The 90-day mark

Put it on your calendar now: **90 days after you first use the tool at work**, open `docs/baseline-metrics.md` and make the go/no-go call. Don't let it drift. A project without a decision date becomes a project without a decision.

Good luck. Build small, use it, then expand.
