import Link from "next/link";

import { VendorForm } from "@/components/features/vendors/vendor-form";
import { createVendor } from "@/app/vendors/actions";

export const metadata = { title: "New vendor — Maintenance" };

export default function NewVendorPage() {
  return (
    <main className="mx-auto max-w-[640px] px-4 py-12">
      <Link
        href="/vendors"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to vendors
      </Link>
      <h1 className="text-foreground mb-6 text-lg font-medium">New vendor</h1>
      <VendorForm action={createVendor} submitLabel="Create vendor" />
    </main>
  );
}
