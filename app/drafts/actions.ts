"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient } from "@/lib/db/admin";

const draftUpdateSchema = z.object({
  recipient_email: z.string().trim().max(200),
  subject: z.string().trim().min(1, "Subject is required").max(500),
  body: z.string().min(1, "Body is required").max(20000),
  status: z.enum(["draft", "sent", "ignored"]),
});

export type DraftFormState =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]>; message?: string };

export async function updateDraft(
  id: string,
  _prev: DraftFormState | undefined,
  formData: FormData,
): Promise<DraftFormState> {
  const raw = {
    recipient_email: formData.get("recipient_email") ?? "",
    subject: formData.get("subject") ?? "",
    body: formData.get("body") ?? "",
    status: formData.get("status") ?? "draft",
  };
  const parsed = draftUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("email_draft")
    .update({
      recipient_email: parsed.data.recipient_email,
      subject: parsed.data.subject,
      body: parsed.data.body,
      status: parsed.data.status,
    })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      fieldErrors: {},
      message: `Couldn't save: ${error.message}`,
    };
  }

  revalidatePath("/drafts");
  revalidatePath(`/drafts/${id}`);
  return { ok: true };
}

export async function deleteDraft(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("email_draft").delete().eq("id", id);
  if (error) {
    throw new Error(`Couldn't delete draft: ${error.message}`);
  }
  revalidatePath("/drafts");
  redirect("/drafts");
}
