"use client";

import { useActionState } from "react";

import type { EquipmentRow } from "@/lib/db/types";
import type { EquipmentFormState } from "@/app/equipment/actions";

interface EquipmentFormProps {
  initial?: Pick<
    EquipmentRow,
    "name" | "type" | "manufacturer" | "model" | "serial" | "install_date" | "location" | "notes"
  >;
  action: (
    state: EquipmentFormState | undefined,
    formData: FormData,
  ) => Promise<EquipmentFormState>;
  submitLabel: string;
}

const inputCls =
  "border-input bg-background focus-within:border-ring focus-within:ring-ring/30 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-within:ring-2";

export function EquipmentForm({ initial, action, submitLabel }: EquipmentFormProps) {
  const [state, formAction, isPending] = useActionState<EquipmentFormState | undefined, FormData>(
    action,
    undefined,
  );

  const fieldError = (name: string): string | undefined => {
    if (!state || state.ok !== false) return undefined;
    return state.fieldErrors[name]?.[0];
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.ok && state.message && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          {state.message}
        </div>
      )}

      <Field label="Name" name="name" error={fieldError("name")} required>
        <input
          name="name"
          type="text"
          required
          defaultValue={initial?.name ?? ""}
          className={inputCls}
          autoComplete="off"
          placeholder="e.g. Main Kitchen Dishwasher"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type" name="type" error={fieldError("type")}>
          <input
            name="type"
            type="text"
            defaultValue={initial?.type ?? ""}
            className={inputCls}
            autoComplete="off"
            placeholder="dishwasher, pump, hvac…"
          />
        </Field>
        <Field label="Location" name="location" error={fieldError("location")}>
          <input
            name="location"
            type="text"
            defaultValue={initial?.location ?? ""}
            className={inputCls}
            autoComplete="off"
            placeholder="e.g. Kitchen, back wall"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Manufacturer" name="manufacturer" error={fieldError("manufacturer")}>
          <input
            name="manufacturer"
            type="text"
            defaultValue={initial?.manufacturer ?? ""}
            className={inputCls}
            autoComplete="off"
            placeholder="e.g. Hobart"
          />
        </Field>
        <Field label="Model" name="model" error={fieldError("model")}>
          <input
            name="model"
            type="text"
            defaultValue={initial?.model ?? ""}
            className={`${inputCls} font-mono`}
            autoComplete="off"
            placeholder="e.g. CL44e"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Serial" name="serial" error={fieldError("serial")}>
          <input
            name="serial"
            type="text"
            defaultValue={initial?.serial ?? ""}
            className={`${inputCls} font-mono`}
            autoComplete="off"
            placeholder="optional"
          />
        </Field>
        <Field label="Install date" name="install_date" error={fieldError("install_date")}>
          <input
            name="install_date"
            type="date"
            defaultValue={initial?.install_date ?? ""}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Notes" name="notes" error={fieldError("notes")}>
        <textarea
          name="notes"
          rows={4}
          defaultValue={initial?.notes ?? ""}
          className={`${inputCls} resize-y font-sans`}
          placeholder="Quirks, history, fitment notes — anything useful you'd otherwise lose."
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        {state?.ok === true && !isPending && (
          <span className="text-muted-foreground text-xs">Saved.</span>
        )}
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, name, error, required, children }: FieldProps) {
  return (
    <label htmlFor={name} className="flex flex-col gap-1.5">
      <span className="text-foreground text-xs font-medium">
        {label}
        {required && <span className="text-muted-foreground ml-1">*</span>}
      </span>
      {children}
      {error && <span className="text-destructive text-xs">{error}</span>}
    </label>
  );
}
