import Link from "next/link";

import { createClient } from "@/lib/db/server";
import { EquipmentFilter } from "@/components/features/equipment/equipment-filter";

export const metadata = { title: "Equipment — Maintenance" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("equipment")
    .select("id, name, type, manufacturer, model, location")
    .order("name", { ascending: true })
    .limit(PAGE_SIZE);

  if (q.length > 0) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error } = await query;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-lg font-medium">Equipment</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Major pieces of gear at the facility. Created here or incidentally from part searches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EquipmentFilter defaultQuery={q} />
          <Link
            href="/equipment/new"
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
          <p className="font-medium">Couldn&apos;t load equipment.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {q
            ? "No equipment matches that search. Clear the filter to see all."
            : "No equipment yet. Click New to add the first one — or run a part search and link results to a new equipment record."}
        </p>
      ) : (
        <ul className="border-border divide-border bg-card divide-y rounded-md border">
          {data.map((e) => (
            <li key={e.id}>
              <Link
                href={`/equipment/${e.id}`}
                className="hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:ring-ring flex flex-col gap-0.5 px-3 py-2 transition-colors focus-visible:ring-1 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-sm">{e.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {[e.manufacturer, e.model].filter(Boolean).join(" ") || (
                      <span className="opacity-60">no model</span>
                    )}
                    {e.location && <span> · {e.location}</span>}
                  </span>
                </div>
                {e.type && (
                  <span className="text-muted-foreground border-border rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase">
                    {e.type}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
