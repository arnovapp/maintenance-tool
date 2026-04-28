/**
 * POST /api/search/parts
 *
 * Streams a structured part-sourcing response from Claude back to the
 * browser. On stream completion, persists the search to the
 * `part_search` table (best effort — Supabase failures don't fail the
 * user-visible response).
 *
 * Acceptance for T1.1:
 *   - Under 15 seconds from submit to first usable results
 *   - At least 3 usable results for common parts
 *   - Results are persisted (when Supabase is configured)
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { NextResponse } from "next/server";

import { partSearchRequestSchema, partSearchResponseSchema } from "@/lib/ai/part-search/schema";
import { PART_SOURCING_SYSTEM_PROMPT } from "@/lib/ai/part-search/prompt";
import { getAnthropicApiKey, isAnthropicConfigured } from "@/lib/ai/env";
import { createAdminClient } from "@/lib/db/admin";

// Default per CLAUDE.md (decision-log 2026-04-26).
const MODEL_ID = "claude-sonnet-4-6";

export const runtime = "nodejs";
// Long-running stream; keep server function alive past Vercel's default cap.
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      {
        error: "anthropic_not_configured",
        message: "ANTHROPIC_API_KEY is not set. See docs/setup.md > Anthropic API.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = partSearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  // Build the provider with our key. createAnthropic lets us scope the key
  // to this request's provider rather than depending on env-var pickup
  // at module load (which would fail when env is missing during build).
  const provider = createAnthropic({ apiKey: getAnthropicApiKey() });

  const result = streamObject({
    model: provider(MODEL_ID),
    schema: partSearchResponseSchema,
    system: PART_SOURCING_SYSTEM_PROMPT,
    prompt: parsed.data.input_text,
    onFinish: async ({ object, error }) => {
      if (!object || error) return;
      // Best-effort persistence. Don't surface DB failures to the user.
      try {
        const supabase = createAdminClient();
        await supabase.from("part_search").insert({
          input_text: parsed.data.input_text,
          results: object.results ?? [],
        });
      } catch (err) {
        // Log only; the streamed response has already left the building.
        console.warn("[part-search] persistence skipped:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
