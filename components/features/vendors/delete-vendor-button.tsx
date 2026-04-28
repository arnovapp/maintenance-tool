"use client";

import { useTransition } from "react";

import { deleteVendor } from "@/app/vendors/actions";

interface DeleteVendorButtonProps {
  id: string;
  name: string;
}

/**
 * Delete confirmation via the browser's built-in confirm() — no custom
 * modal in v1 per design-guide ("complexity is a cost; one screen per
 * operation"). On confirm, calls the deleteVendor server action which
 * redirects back to /vendors.
 */
export function DeleteVendorButton({ id, name }: DeleteVendorButtonProps) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (
      !window.confirm(
        `Delete vendor "${name}"? This cannot be undone — past part-search and email-draft links to this vendor will lose their reference.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteVendor(id);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="border-destructive/40 text-destructive hover:bg-destructive/10 focus-visible:ring-destructive inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
