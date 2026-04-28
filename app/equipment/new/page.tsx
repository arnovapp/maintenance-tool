import Link from "next/link";

import { EquipmentForm } from "@/components/features/equipment/equipment-form";
import { createEquipment } from "@/app/equipment/actions";

export const metadata = { title: "New equipment — Maintenance" };

export default function NewEquipmentPage() {
  return (
    <main className="mx-auto max-w-[680px] px-4 py-12">
      <Link
        href="/equipment"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to equipment
      </Link>
      <h1 className="text-foreground mb-6 text-lg font-medium">New equipment</h1>
      <EquipmentForm action={createEquipment} submitLabel="Create equipment" />
    </main>
  );
}
