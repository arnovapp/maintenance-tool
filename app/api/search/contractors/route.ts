/**
 * POST /api/search/contractors
 *
 * Streams a structured contractor-finding response from Claude. Same
 * shape as /api/search/parts, distinct prompt + result schema. On
 * stream completion, persists the search to part_search with
 * search_type='contractor' (the table is shared per docs/task-breakdown
 * T2.2; the search_type column was added in migration
 * 20260428000001_part_search_search_type.sql).
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { NextResponse } from "next/server";

import {
  contractorSearchRequestSchema,
  contractorSearchResponseSchema,
} from "@/lib/ai/contractor-search/schema";
import { CONTRACTOR_FINDING_SYSTEM_PROMPT } from "@/lib/ai/contractor-search/prompt";
import { getAnthropicApiKey, isAnthropicConfigured } from "@/lib/ai/env";
import { createAdminClient } from "@/lib/db/admin";

const MODEL_ID = "claude-sonnet-4-6";

export const runtime = "nodejs";
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

  const parsed = contractorSearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const provider = createAnthropic({ apiKey: getAnthropicApiKey() });

  const result = streamObject({
    model: provider(MODEL_ID),
    schema: contractorSearchResponseSchema,
    system: CONTRACTOR_FINDING_SYSTEM_PROMPT,
    prompt: parsed.data.input_text,
    onFinish: async ({ object, error }) => {
      if (!object || error) return;
      try {
        const supabase = createAdminClient();
        await supabase.from("part_search").insert({
          input_text: parsed.data.input_text,
          results: object.results ?? [],
          search_type: "contractor",
        });
      } catch (err) {
        console.warn("[contractor-search] persistence skipped:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
