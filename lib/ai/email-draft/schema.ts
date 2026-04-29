import { z } from "zod";

/**
 * Output of the email-drafting prompt — a vendor outreach email.
 * Subject + body are required. The model is told to keep the email
 * tight and professional; not to oversell, and to leave a clear ask.
 */
export const emailDraftSchema = z.object({
  subject: z.string().describe("Email subject line. Concise — under 60 characters when possible."),
  body: z
    .string()
    .describe(
      "Full email body. Plain text. Includes greeting, brief context, the specific ask, and a sign-off. No marketing language.",
    ),
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;

export const draftContractorEmailRequestSchema = z.object({
  /** The contractor's name. */
  contractorName: z.string().min(1).max(200),
  /** Free-text job description that produced the contractor result. */
  jobDescription: z.string().min(2).max(2000),
  /** What the model wrote about the contractor's specialty. */
  specialty: z.string().max(500).optional(),
  /** capability_evidence from the contractor result. */
  capabilityEvidence: z.string().max(1000).optional(),
});

export type DraftContractorEmailRequest = z.infer<typeof draftContractorEmailRequestSchema>;
