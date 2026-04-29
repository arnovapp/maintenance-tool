import Link from "next/link";

import { createClient } from "@/lib/db/server";
import { VendorsFilter } from "@/components/features/vendors/vendors-filter";

export const metadata = { title: "Vendors — Maintenance" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

const TYPE_LABEL: Record<string, string> = {
  supplier: "Supplier",
  contractor: "Contractor",
  service: "Service",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const typeFilter =
    params.type === "supplier" || params.type === "contractor" || params.type === "service"
      ? params.type
      : "";

  const supabase = await createClient();
  let query = supabase
    .from("vendor")
    .select("id, name, type, specialty, email")
    .order("name", { ascending: true })
    .limit(PAGE_SIZE);

  if (q.length > 0) {
    query = query.ilike("name", `%${q}%`);
  }
  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data, error } = await query;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-lg font-medium">Vendors</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Suppliers, contractors, and service providers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VendorsFilter defaultQuery={q} defaultType={typeFilter} />
          <Link
            href="/vendors/find"
            className="border-input bg-background text-foreground hover:bg-accent/40 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            Find
          </Link>
          <Link
            href="/vendors/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            New
          </Link>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load vendors.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {q || typeFilter
            ? "No vendors match the current filter. Clear it to see all."
            : "No vendors yet. Click New to add the first one."}
        </p>
      ) : (
        <ul className="border-border divide-border bg-card divide-y rounded-md border">
          {data.map((v) => (
            <li key={v.id}>
              <Link
                href={`/vendors/${v.id}`}
                className="hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:ring-ring flex flex-col gap-0.5 px-3 py-2 transition-colors focus-visible:ring-1 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-sm">{v.name}</span>
                  {v.specialty && (
                    <span className="text-muted-foreground truncate text-xs">{v.specialty}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {v.email && (
                    <span className="text-muted-foreground hidden sm:inline">{v.email}</span>
                  )}
                  <span className="text-muted-foreground border-border rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase">
                    {TYPE_LABEL[v.type] ?? v.type}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
