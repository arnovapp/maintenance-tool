import Link from "next/link";

import { createClient } from "@/lib/db/server";

import { SearchFilter } from "@/components/features/searches/search-filter";

export const metadata = { title: "Searches — Maintenance" };

// Each visit re-queries — keeps history fresh without extra ceremony.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface SearchSummary {
  id: string;
  input_text: string | null;
  created_at: string;
  result_count: number;
  equipment_id: string | null;
}

function summarizeRow(row: {
  id: string;
  input_text: string | null;
  created_at: string;
  results: unknown;
  equipment_id: string | null;
}): SearchSummary {
  const results = Array.isArray(row.results) ? row.results : [];
  return {
    id: row.id,
    input_text: row.input_text,
    created_at: row.created_at,
    result_count: results.length,
    equipment_id: row.equipment_id,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  // Pacific-time-friendly short format. Switch to user-locale-aware
  // when there's more than one user.
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function SearchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("part_search")
    .select("id, input_text, created_at, results, equipment_id")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (q.length > 0) {
    // Simple substring filter on input_text. Postgres ILIKE = case-insensitive.
    query = query.ilike("input_text", `%${q}%`);
  }

  const { data, error } = await query;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-lg font-medium">Searches</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Past part-sourcing searches. Click any row to reopen.
          </p>
        </div>
        <SearchFilter defaultValue={q} />
      </div>

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load searches.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {q
            ? `No past searches match "${q}". Clear the filter to see all.`
            : "No searches yet. Try one from the home page."}
        </p>
      ) : (
        <ul className="border-border divide-border bg-card divide-y rounded-md border">
          {data.map((row) => {
            const s = summarizeRow(row);
            return (
              <li key={s.id}>
                <Link
                  href={`/searches/${s.id}`}
                  className="hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:ring-ring flex flex-col gap-0.5 px-3 py-2 transition-colors focus-visible:ring-1 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-foreground truncate text-sm">
                      {s.input_text ?? "(image search)"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {s.result_count} result{s.result_count === 1 ? "" : "s"}
                      {s.equipment_id && " · linked equipment"}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatDate(s.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
