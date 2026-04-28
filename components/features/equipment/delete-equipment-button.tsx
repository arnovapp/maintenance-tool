"use client";

import { useTransition } from "react";

import { deleteEquipment } from "@/app/equipment/actions";

interface DeleteEquipmentButtonProps {
  id: string;
  name: string;
}

export function DeleteEquipmentButton({ id, name }: DeleteEquipmentButtonProps) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (
      !window.confirm(
        `Delete equipment "${name}"? This cannot be undone — past part-search and email-draft links to this equipment will lose their reference.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteEquipment(id);
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
