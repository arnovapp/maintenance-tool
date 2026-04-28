import { z } from "zod";

/**
 * One supplier option for a sourced part. Most fields are optional
 * because real sourcing data is messy — the AI shouldn't invent a
 * price if it can't verify one. The UI handles undefined gracefully.
 */
export const partSearchResultSchema = z.object({
  part_number: z
    .string()
    .describe("Manufacturer's official part number, with model qualifier when applicable."),
  supplier: z.string().describe("Company or storefront name."),
  price_cad: z
    .number()
    .optional()
    .describe("Estimated price in CAD. Omit if you cannot verify a current value."),
  url: z
    .string()
    .url()
    .describe("Direct link to the product page. Must be a real URL — do not invent links."),
  availability: z
    .string()
    .optional()
    .describe(
      "Free-form availability indicator (e.g. 'in stock', 'ships in 5 days', 'backordered', 'unknown').",
    ),
  confidence: z
    .enum(["high", "medium", "low"])
    .optional()
    .describe(
      "high if cross-verified against the manufacturer site; medium if inferred from model number; low if uncertain.",
    ),
  notes: z.string().optional().describe("Caveats, fitment warnings, or other relevant context."),
});

export type PartSearchResult = z.infer<typeof partSearchResultSchema>;

/**
 * The full structured response from the part-sourcing prompt.
 *
 * `query_understood` lets the AI restate what it searched for so the
 * user can correct a misread input — important when the input is
 * a one-line description of an obscure part.
 */
export const partSearchResponseSchema = z.object({
  query_understood: z
    .string()
    .describe("A short restatement of the search the AI performed, so the user can spot misreads."),
  results: z
    .array(partSearchResultSchema)
    .describe(
      "Ranked supplier options. Aim for 3–5 high-quality results; never more than 8. " +
        "(Length is enforced via the system prompt — Anthropic structured output " +
        "rejects array length constraints in the schema.)",
    ),
});

export type PartSearchResponse = z.infer<typeof partSearchResponseSchema>;

/**
 * Input shape for the /api/search/parts route. Kept separate from the
 * response schema so the validation surface for the API is explicit.
 */
export const partSearchRequestSchema = z.object({
  input_text: z.string().min(2).max(2000),
  // image input lands in T1.2
});

export type PartSearchRequest = z.infer<typeof partSearchRequestSchema>;
