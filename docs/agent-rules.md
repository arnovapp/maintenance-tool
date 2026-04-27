# Agent Rules

This document governs autonomous agent behavior on this repo — Claude Code, Cowork/Dispatch, Chrome control agents, and any other AI that touches the code or infrastructure.

The user is the only human on this project in v1. Multiple agents may be working concurrently or around the clock. Without clear rules, they will step on each other, produce inconsistent code, and erode trust. These rules exist to prevent that.

---

## The approval gate principle

The same principle that governs the app's behavior governs the agents' behavior on it:

> **Agents draft. The human approves.**

This means:
- Agents write code on feature branches.
- Agents open PRs with clear descriptions.
- The human reviews, requests changes, or merges.
- Nothing ships to `main` without a human merge click.
- Nothing ships to production without a human deployment action (or a human-approved CI workflow).

This is not about distrust. It's about preserving the signal that the tool is doing what the user intended, so that when something eventually goes wrong (and something will), the human is close enough to the work to recognize and correct it quickly.

## What agents can do autonomously

- Read any file in the repo
- Write to feature branches (never `main`)
- Open pull requests
- Comment on PRs, issues, and code
- Run tests, linters, formatters
- Install dependencies **that are already in `package.json`**
- Query and read from Supabase development environments
- Call Claude API, Resend API, and any other dev-mode integrations
- Produce and update documentation
- Generate design mockups and prototypes in a branch

## What agents cannot do without explicit human approval

- Merge to `main`
- Deploy to production
- Add new dependencies (`package.json` additions) — propose in PR, human merges
- Modify environment variables in any live environment
- Run migrations against production Supabase
- Delete data from any Supabase table (including dev)
- Rotate API keys or credentials
- Make changes to domain / DNS / Vercel project settings
- Post external communications (Slack, email, Twitter, anywhere) on behalf of the user or project
- Spend money (create paid resources, upgrade service tiers)
- Run any operation against the user's real Gmail account in development — always use a test account or sandbox

Any request that would require one of these actions should be surfaced in a PR description or comment for the human to handle manually.

## The PR workflow

### Branch naming
`<type>/<short-description>`

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`
Example: `feat/part-sourcing-photo-input`

### Commit messages
Conventional commits. Present tense, imperative. Explain *why* when it's not obvious from the *what*.

Good: `feat: add photo input to part sourcing form`
Good: `fix: preserve search history after browser refresh`
Bad: `updates`
Bad: `WIP`

### PR description template

Every PR description follows the template in `.github/pull_request_template.md`. Sections:

```
## What
Brief description of the change.

## Why
Why this change is needed. Reference the task or scope doc if applicable.

## How to test
Steps for the human to verify this works. Include test data if needed.

## Screenshots
For any UI change. Before and after if modifying existing UI.

## Risks and follow-ups
Anything risky about this change. Any known follow-up work.

## Questions for review
Anything the agent wasn't sure about. Propose an answer, flag the uncertainty.

## Scope check
Confirm this PR stays within v1 scope. If it doesn't, explain why it should be allowed anyway, or split the out-of-scope work into a separate PR / backlog item.
```

### PR size
Small PRs ship faster and review better. Target under 400 lines of diff where possible. Break large features into sequenced PRs rather than one huge one.

### Stacked PRs are fine
For large features, stack PRs (dependent branches). Describe the stack order in the PR description so the human reviews in the right sequence.

## Coordinating multiple agents

### Claim tasks before working on them
The task list in `docs/task-breakdown.md` is the source of truth for what's being worked on. Before starting a task:
1. Check that no one else has claimed it (look for an `@claimed` tag with a timestamp)
2. Add a claim line to the task with your agent identifier and timestamp
3. Open a draft PR immediately when you start coding, even if empty — this signals work in progress

### Release claims on stall
If an agent hasn't made progress on a claimed task in 4 hours, another agent can release the claim and take it. The releasing agent leaves a comment explaining what was attempted.

### Don't cross streams
Agents should not modify files outside their task's scope. If a task requires incidental changes to unrelated code (e.g., a utility function needs updating), open a separate PR for that change first, merge it, then continue with the main task.

### Communicate through the PR
All coordination happens in PR descriptions and comments. No implicit agreements, no out-of-band coordination. If the human needs to know about a tradeoff, it goes in the PR.

## Scope enforcement

Every PR has a **scope check** section. This forces a conscious answer to "does this PR stay within v1?"

If an agent finds itself wanting to build something outside v1:

1. Stop work on the out-of-scope piece immediately
2. Complete the in-scope work
3. Add the out-of-scope idea to `docs/v2-backlog.md` with context from the PR
4. Link to it from the PR description as a "follow-up" suggestion

The human will decide whether to promote it into scope. Agents do not promote their own work.

## Failure modes to watch for

These are patterns that have caused problems on other projects. Agents should self-check against them.

### "I'll just also..."
The impulse to fix an unrelated thing while working on a task. Don't. Open a separate PR or add it to the backlog.

### Reinventing patterns
Before writing a new utility or component, search the codebase for existing solutions. Reuse where reasonable.

### Premature abstraction
Don't create a generic helper to handle three call sites until the third call site exists. Inline duplication is fine until it isn't.

### Over-testing or under-testing
Tests follow the value of the code. Don't write tests for trivial getters. Do write tests for AI-prompt schemas, data parsing, and anything where regression would be silent.

### Hallucinating dependencies
Before importing something, confirm it exists in `package.json`. Don't assume.

### Hallucinating Supabase or DB shape
Always check generated types and migrations. Don't write code against a schema that doesn't exist.

### Skipping the scope check
The temptation to skip the scope check on a "small" change. Don't. The scope check exists because small changes accumulate into scope creep.

## When something breaks

If an agent's PR breaks the build, breaks a test, or breaks production:

1. The agent that opened the PR is responsible for the fix unless explicitly handed off
2. Open a `fix:` PR immediately — don't try to amend or force-push the original
3. Document the failure in the PR description so future agents (and the human) can learn from it

## When agents disagree

If two PRs propose conflicting approaches to the same problem, the human is the tiebreaker. Don't merge either side until the human weighs in. Use PR comments to lay out both approaches.

---

The goal of these rules: a year from now, when the user opens this repo and sees a clean history of small, well-described PRs, they can trace exactly how every feature came to exist, and who (or what) built it. That traceability is worth more than any individual feature.
