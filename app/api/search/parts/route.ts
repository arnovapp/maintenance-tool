/**
 * POST /api/search/parts
 *
 * Streams a structured part-sourcing response from Claude back to the
 * browser. Accepts text, an image (via input_image_path pointing at
 * the `part-photos` Storage bucket), or both. On stream completion,
 * persists the search to the `part_search` table (best effort —
 * Supabase failures don't fail the user-visible response).
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

interface ImagePayload {
  base64: string;
  mediaType: string;
}

async function fetchImage(path: string): Promise<ImagePayload | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from("part-photos").download(path);
    if (error || !data) {
      console.warn("[part-search] couldn't load image:", error?.message);
      return null;
    }
    const buffer = Buffer.from(await data.arrayBuffer());
    return {
      base64: buffer.toString("base64"),
      mediaType: data.type || "image/jpeg",
    };
  } catch (err) {
    console.warn("[part-search] image fetch threw:", err);
    return null;
  }
}

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

  const { input_text, input_image_path } = parsed.data;

  // Pull the image (if any) before opening the stream so any 4xx surfaces
  // as a normal HTTP response, not a stream that closes silently.
  const image = input_image_path ? await fetchImage(input_image_path) : null;
  if (input_image_path && !image) {
    return NextResponse.json(
      {
        error: "image_unavailable",
        message:
          "Couldn't load the uploaded image from storage. It may have expired or the path is wrong.",
      },
      { status: 400 },
    );
  }

  const provider = createAnthropic({ apiKey: getAnthropicApiKey() });

  // Build the user message: text + optional image. When only an image
  // is provided, give a brief default instruction so the model has a
  // task framing.
  const userTextPart =
    input_text && input_text.length > 0
      ? input_text
      : "Identify the part, model, and manufacturer in this image, then source it.";

  const userContent: Array<
    { type: "text"; text: string } | { type: "image"; image: string; mediaType: string }
  > = [{ type: "text", text: userTextPart }];

  if (image) {
    userContent.push({
      type: "image",
      image: image.base64,
      mediaType: image.mediaType,
    });
  }

  const result = streamObject({
    model: provider(MODEL_ID),
    schema: partSearchResponseSchema,
    system: PART_SOURCING_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
    onFinish: async ({ object, error }) => {
      if (!object || error) return;
      try {
        const supabase = createAdminClient();
        await supabase.from("part_search").insert({
          input_text: input_text ?? null,
          input_image_url: input_image_path ?? null,
          results: object.results ?? [],
        });
      } catch (err) {
        console.warn("[part-search] persistence skipped:", err);
      }
    },
  });

  return result.toTextStreamResponse();
}
