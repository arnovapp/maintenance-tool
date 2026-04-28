import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { VendorForm } from "@/components/features/vendors/vendor-form";
import { DeleteVendorButton } from "@/components/features/vendors/delete-vendor-button";
import { updateVendor } from "@/app/vendors/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<{ title: string }> {
  return { title: "Vendor — Maintenance" };
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendor")
    .select("id, name, type, email, phone, website, specialty, notes")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-[640px] px-4 py-12">
        <Link
          href="/vendors"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
        >
          ← Back to vendors
        </Link>
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load this vendor.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const updateAction = updateVendor.bind(null, id);

  return (
    <main className="mx-auto max-w-[640px] px-4 py-12">
      <Link
        href="/vendors"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to vendors
      </Link>
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-foreground text-lg font-medium">{data.name}</h1>
        <DeleteVendorButton id={id} name={data.name} />
      </header>
      <VendorForm initial={data} action={updateAction} submitLabel="Save changes" />
    </main>
  );
}
