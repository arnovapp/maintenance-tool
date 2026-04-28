"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient } from "@/lib/db/admin";

const equipmentFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  model: z.string().trim().optional(),
  serial: z.string().trim().optional(),
  install_date: z.string().trim().optional(),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type EquipmentFormState =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string[]>; message?: string };

function parseFormData(
  formData: FormData,
): EquipmentFormState | { ok: true; data: z.infer<typeof equipmentFormSchema> } {
  const raw = {
    name: formData.get("name") ?? "",
    type: formData.get("type") ?? "",
    manufacturer: formData.get("manufacturer") ?? "",
    model: formData.get("model") ?? "",
    serial: formData.get("serial") ?? "",
    install_date: formData.get("install_date") ?? "",
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
  };
  const parsed = equipmentFormSchema.safeParse(raw);
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

export async function createEquipment(
  _prev: EquipmentFormState | undefined,
  formData: FormData,
): Promise<EquipmentFormState> {
  const result = parseFormData(formData);
  if (!("data" in result)) return result;

  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("equipment")
    .insert({
      name: result.data.name,
      type: emptyToNull(result.data.type),
      manufacturer: emptyToNull(result.data.manufacturer),
      model: emptyToNull(result.data.model),
      serial: emptyToNull(result.data.serial),
      install_date: emptyToNull(result.data.install_date),
      location: emptyToNull(result.data.location),
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

  revalidatePath("/equipment");
  redirect(`/equipment/${row.id}`);
}

export async function updateEquipment(
  id: string,
  _prev: EquipmentFormState | undefined,
  formData: FormData,
): Promise<EquipmentFormState> {
  const result = parseFormData(formData);
  if (!("data" in result)) return result;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("equipment")
    .update({
      name: result.data.name,
      type: emptyToNull(result.data.type),
      manufacturer: emptyToNull(result.data.manufacturer),
      model: emptyToNull(result.data.model),
      serial: emptyToNull(result.data.serial),
      install_date: emptyToNull(result.data.install_date),
      location: emptyToNull(result.data.location),
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

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${id}`);
  return { ok: true };
}

export async function deleteEquipment(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) {
    throw new Error(`Couldn't delete equipment: ${error.message}`);
  }
  revalidatePath("/equipment");
  redirect("/equipment");
}
