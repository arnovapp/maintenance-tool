import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { partSearchResultSchema, type PartSearchResult } from "@/lib/ai/part-search/schema";
import { z } from "zod";

import { StoredSearchResults } from "@/components/features/searches/stored-search-results";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const storedResultsSchema = z.array(partSearchResultSchema);

function parseStoredResults(raw: unknown): PartSearchResult[] {
  const parsed = storedResultsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Search ${id.slice(0, 8)} — Maintenance` };
}

export default async function SearchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("part_search")
    .select("id, input_text, created_at, results")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-screen-xl px-4 py-12">
        <Link
          href="/searches"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
        >
          ← Back to all searches
        </Link>
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load this search.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const results = parseStoredResults(data.results);

  return (
    <main className="mx-auto max-w-[820px] px-4 py-12">
      <Link
        href="/searches"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to all searches
      </Link>

      <header className="mb-6">
        <h1 className="text-foreground text-lg font-medium">
          {data.input_text ?? "(image search)"}
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {formatLongDate(data.created_at)}
        </p>
      </header>

      <StoredSearchResults results={results} />
    </main>
  );
}
