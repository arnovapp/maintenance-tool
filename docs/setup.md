# Setup

This document describes how to run the project locally and deploy it. It will be filled in as code lands. Until T0.1 merges, this is a placeholder.

---

## Prerequisites (after T0.1)

- Node.js 20+ (use `nvm` or `volta` to pin)
- pnpm 9+
- A Supabase project (free tier OK for v1)
- A Vercel account
- An Anthropic API key
- A Resend account (for v3 email features)

## Local development (filled in after T0.2)

```
git clone <repo-url>
cd maintenance-tool
pnpm install
cp .env.example .env.local
# Fill in .env.local with values from your Supabase, Anthropic, and Resend dashboards
pnpm dev
```

## Environment variables

Document every env var here as it's introduced.

| Variable | Where used | How to obtain |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin | Supabase project settings |
| `ANTHROPIC_API_KEY` | AI calls | console.anthropic.com |
| `RESEND_API_KEY` | Email | resend.com |

## Deployment (filled in after T0.5)

To be documented when Vercel deploy is configured.

## Database migrations (filled in after T0.3)

To be documented when Supabase migrations are configured.

## Running tests

To be documented when test infrastructure exists.

## Troubleshooting

To be documented as issues come up.
