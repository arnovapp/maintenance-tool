import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { EquipmentForm } from "@/components/features/equipment/equipment-form";
import { DeleteEquipmentButton } from "@/components/features/equipment/delete-equipment-button";
import { updateEquipment } from "@/app/equipment/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<{ title: string }> {
  return { title: "Equipment — Maintenance" };
}

export default async function EquipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .select("id, name, type, manufacturer, model, serial, install_date, location, notes")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-[680px] px-4 py-12">
        <Link
          href="/equipment"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
        >
          ← Back to equipment
        </Link>
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load this equipment.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const updateAction = updateEquipment.bind(null, id);

  return (
    <main className="mx-auto max-w-[680px] px-4 py-12">
      <Link
        href="/equipment"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to equipment
      </Link>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-foreground text-lg font-medium">{data.name}</h1>
        <DeleteEquipmentButton id={id} name={data.name} />
      </header>
      <EquipmentForm initial={data} action={updateAction} submitLabel="Save changes" />
    </main>
  );
}
