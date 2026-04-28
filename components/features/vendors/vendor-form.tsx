"use client";

import { useActionState } from "react";

import type { VendorRow } from "@/lib/db/types";
import type { VendorFormState } from "@/app/vendors/actions";

interface VendorFormProps {
  /**
   * Existing vendor row when editing; undefined when creating.
   */
  initial?: Pick<
    VendorRow,
    "name" | "type" | "email" | "phone" | "website" | "specialty" | "notes"
  >;
  /**
   * Server action to call on submit. Both create and update conform
   * to the same useActionState shape so this component can host either.
   */
  action: (state: VendorFormState | undefined, formData: FormData) => Promise<VendorFormState>;
  submitLabel: string;
}

const TYPE_OPTIONS: Array<{ value: "supplier" | "contractor" | "service"; label: string }> = [
  { value: "supplier", label: "Supplier" },
  { value: "contractor", label: "Contractor" },
  { value: "service", label: "Service" },
];

const inputCls =
  "border-input bg-background focus-within:border-ring focus-within:ring-ring/30 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-within:ring-2";

export function VendorForm({ initial, action, submitLabel }: VendorFormProps) {
  const [state, formAction, isPending] = useActionState<VendorFormState | undefined, FormData>(
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
        />
      </Field>

      <Field label="Type" name="type" error={fieldError("type")} required>
        <select
          name="type"
          required
          defaultValue={initial?.type ?? "supplier"}
          className={inputCls}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Email" name="email" error={fieldError("email")}>
        <input
          name="email"
          type="email"
          defaultValue={initial?.email ?? ""}
          className={inputCls}
          autoComplete="off"
        />
      </Field>

      <Field label="Phone" name="phone" error={fieldError("phone")}>
        <input
          name="phone"
          type="tel"
          defaultValue={initial?.phone ?? ""}
          className={inputCls}
          autoComplete="off"
        />
      </Field>

      <Field label="Website" name="website" error={fieldError("website")}>
        <input
          name="website"
          type="url"
          placeholder="https://..."
          defaultValue={initial?.website ?? ""}
          className={inputCls}
          autoComplete="off"
        />
      </Field>

      <Field label="Specialty" name="specialty" error={fieldError("specialty")}>
        <input
          name="specialty"
          type="text"
          placeholder="e.g. commercial kitchen parts, custom millwork"
          defaultValue={initial?.specialty ?? ""}
          className={inputCls}
          autoComplete="off"
        />
      </Field>

      <Field label="Notes" name="notes" error={fieldError("notes")}>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className={`${inputCls} resize-y font-sans`}
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
