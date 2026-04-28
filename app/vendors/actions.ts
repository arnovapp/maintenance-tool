"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient } from "@/lib/db/admin";

/**
 * Shared schema for create + update form payloads. `type` is the only
 * truly required field beyond `name`; everything else is optional and
 * stored as null when blank — keeps the UI low-friction (paste a name,
 * pick a type, fill the rest later).
 */
const vendorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["supplier", "contractor", "service"], {
    message: "Type must be supplier, contractor, or service",
  }),
  email: z.string().trim().email("Email is invalid").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().url("Website must be a full URL").or(z.literal("")).optional(),
  specialty: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type VendorFormState =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]>; message?: string };

function parseFormData(
  formData: FormData,
): VendorFormState | { ok: true; data: z.infer<typeof vendorFormSchema> } {
  const raw = {
    name: formData.get("name") ?? "",
    type: formData.get("type") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    website: formData.get("website") ?? "",
    specialty: formData.get("specialty") ?? "",
    notes: formData.get("notes") ?? "",
  };
  const parsed = vendorFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return { ok: true, data: parsed.data };
}

function emptyToNull(v: string | undefined): string | null {
  if (v === undefined) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function createVendor(
  _prev: VendorFormState | undefined,
  formData: FormData,
): Promise<VendorFormState> {
  const result = parseFormData(formData);
  if (!("data" in result)) return result;

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("vendor")
    .insert({
      name: result.data.name,
      type: result.data.type,
      email: emptyToNull(result.data.email),
      phone: emptyToNull(result.data.phone),
      website: emptyToNull(result.data.website),
      specialty: emptyToNull(result.data.specialty),
      notes: emptyToNull(result.data.notes),
    })
    .select("id")
    .single();

  if (error || !row) {
    return {
      ok: false,
      fieldErrors: {},
      message: `Couldn't save: ${error?.message ?? "no row returned"}`,
    };
  }

  revalidatePath("/vendors");
  redirect(`/vendors/${row.id}`);
}

export async function updateVendor(
  id: string,
  _prev: VendorFormState | undefined,
  formData: FormData,
): Promise<VendorFormState> {
  const result = parseFormData(formData);
  if (!("data" in result)) return result;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("vendor")
    .update({
      name: result.data.name,
      type: result.data.type,
      email: emptyToNull(result.data.email),
      phone: emptyToNull(result.data.phone),
      website: emptyToNull(result.data.website),
      specialty: emptyToNull(result.data.specialty),
      notes: emptyToNull(result.data.notes),
    })
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      fieldErrors: {},
      message: `Couldn't save: ${error.message}`,
    };
  }

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${id}`);
  return { ok: true };
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("vendor").delete().eq("id", id);
  if (error) {
    throw new Error(`Couldn't delete vendor: ${error.message}`);
  }
  revalidatePath("/vendors");
  redirect("/vendors");
}
