import { z } from "zod";

/**
 * One local-business candidate produced by the contractor-finder flow.
 *
 * `capability_evidence` is the part that justifies the recommendation:
 * a short quote or paraphrase of something on the business's website
 * that demonstrates they actually do the kind of work the user
 * described. The model is told never to invent this — if it can't
 * find evidence, it omits the result.
 */
export const contractorSearchResultSchema = z.object({
  name: z.string().describe("Company / business name."),
  website: z
    .string()
    .url()
    .optional()
    .describe("Direct URL to their website. Omit if the model can't verify one."),
  email: z
    .string()
    .email()
    .or(z.literal(""))
    .optional()
    .describe("General contact / quotes inbox."),
  phone: z.string().optional().describe("Phone number, ideally with country code."),
  specialty: z
    .string()
    .describe("Short summary of their declared specialty, in their own framing."),
  capability_evidence: z
    .string()
    .describe(
      "A short quote or paraphrase from their site that demonstrates they actually do the kind of work the user described. Never invent — if you can't find this, omit the result.",
    ),
  distance_note: z
    .string()
    .optional()
    .describe(
      "Approximate distance / travel area (e.g. 'Vancouver — Lower Mainland', '~12 km from V6Z'). Omit if uncertain.",
    ),
  confidence: z
    .enum(["high", "medium", "low"])
    .optional()
    .describe("high if cross-verified against their site; medium if inferred; low if uncertain."),
  notes: z.string().optional().describe("Caveats, lead-time hints, or other relevant context."),
});

export type ContractorSearchResult = z.infer<typeof contractorSearchResultSchema>;

export const contractorSearchResponseSchema = z.object({
  query_understood: z
    .string()
    .describe(
      "A short restatement of the job the AI is sourcing for, so the user can spot misreads.",
    ),
  results: z
    .array(contractorSearchResultSchema)
    .describe(
      "Ranked local-business candidates. Aim for 3–5 high-quality results; never more than 8. Length is enforced via the system prompt — Anthropic structured output rejects array length constraints in the schema.",
    ),
});

export type ContractorSearchResponse = z.infer<typeof contractorSearchResponseSchema>;

export const contractorSearchRequestSchema = z.object({
  input_text: z.string().min(2).max(2000),
});

export type ContractorSearchRequest = z.infer<typeof contractorSearchRequestSchema>;
