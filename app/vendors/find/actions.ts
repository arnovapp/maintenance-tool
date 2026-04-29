"use server";

import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

import { createAdminClient } from "@/lib/db/admin";
import { getAnthropicApiKey, isAnthropicConfigured } from "@/lib/ai/env";
import { CONTRACTOR_OUTREACH_SYSTEM_PROMPT } from "@/lib/ai/email-draft/prompt";
import { emailDraftSchema } from "@/lib/ai/email-draft/schema";

const MODEL_ID = "claude-sonnet-4-6";

interface SaveContractorInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  specialty?: string | null;
  notes?: string | null;
}

export type SaveContractorResult = { ok: true; vendorId: string } | { ok: false; reason: string };

export async function saveContractorAsVendor(
  input: SaveContractorInput,
): Promise<SaveContractorResult> {
  if (!input.name?.trim()) {
    return { ok: false, reason: "Contractor name is required." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("vendor")
    .insert({
      name: input.name.trim(),
      type: "contractor",
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      website: input.website?.trim() || null,
      specialty: input.specialty?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, reason: error?.message ?? "no row returned" };
  }

  revalidatePath("/vendors");
  return { ok: true, vendorId: data.id };
}

interface DraftContractorEmailInput {
  contractorName: string;
  contractorEmail?: string | null;
  jobDescription: string;
  specialty?: string | null;
  capabilityEvidence?: string | null;
  vendorId?: string | null;
}

export type DraftContractorEmailResult =
  | { ok: true; draftId: string }
  | { ok: false; reason: string };

export async function draftContractorEmail(
  input: DraftContractorEmailInput,
): Promise<DraftContractorEmailResult> {
  if (!isAnthropicConfigured()) {
    return {
      ok: false,
      reason: "ANTHROPIC_API_KEY is not set. See docs/setup.md > Anthropic API.",
    };
  }

  const provider = createAnthropic({ apiKey: getAnthropicApiKey() });

  const userPrompt = [
    `Contractor: ${input.contractorName}`,
    input.specialty ? `Specialty (their framing): ${input.specialty}` : null,
    input.capabilityEvidence
      ? `Capability evidence I found on their site: "${input.capabilityEvidence}"`
      : null,
    "",
    "Job I want to ask them about (verbatim from my search):",
    input.jobDescription,
  ]
    .filter(Boolean)
    .join("\n");

  let object;
  try {
    const result = await generateObject({
      model: provider(MODEL_ID),
      schema: emailDraftSchema,
      system: CONTRACTOR_OUTREACH_SYSTEM_PROMPT,
      prompt: userPrompt,
    });
    object = result.object;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown error";
    return { ok: false, reason: `Drafting failed: ${reason}` };
  }

  // Persist as a local draft. Gmail OAuth (T3.1) will later push this
  // to the user's Gmail Drafts folder; for now it lives in email_draft
  // and is reviewable at /drafts/[id].
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_draft")
    .insert({
      recipient_email: input.contractorEmail?.trim() || "",
      subject: object.subject,
      body: object.body,
      vendor_id: input.vendorId ?? null,
      context_type: "vendor",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      reason: `Saved-draft persistence failed: ${error?.message ?? "no row returned"}`,
    };
  }

  revalidatePath("/drafts");
  return { ok: true, draftId: data.id };
}
