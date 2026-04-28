import { ExternalLink } from "lucide-react";

import { CopyablePartNumber } from "@/components/features/part-search/copyable-part-number";
import type { PartSearchResult } from "@/lib/ai/part-search/schema";

interface StoredSearchResultsProps {
  results: PartSearchResult[];
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "high",
  medium: "med",
  low: "low",
};

function formatCAD(n: number | undefined): string {
  if (n === undefined) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Server-rendered (well, server-forwarded — CopyablePartNumber is "use client")
 * version of the results list, for /searches/[id]. Mirrors PartSearchResults
 * but takes a fully-resolved array — no streaming, no skeletons.
 */
export function StoredSearchResults({ results }: StoredSearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        This search has no stored results. (It may have errored before any results were generated,
        or the AI returned an empty list.)
      </p>
    );
  }

  return (
    <ul className="border-border divide-border bg-card divide-y rounded-md border">
      {results.map((r, i) => (
        <li
          key={`${r.part_number}-${i}`}
          className="hover:bg-accent/40 group flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <CopyablePartNumber partNumber={r.part_number} />
              {r.confidence && (
                <span className="text-muted-foreground border-border rounded border px-1 py-0.5 font-mono text-[10px] uppercase">
                  {CONFIDENCE_LABEL[r.confidence] ?? r.confidence}
                </span>
              )}
            </div>
            <p className="text-foreground/90 truncate text-sm">{r.supplier}</p>
            {r.notes && <p className="text-muted-foreground text-xs">{r.notes}</p>}
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-0">
            <span className="text-foreground font-mono text-sm">{formatCAD(r.price_cad)}</span>
            {r.availability && (
              <span className="text-muted-foreground text-xs">{r.availability}</span>
            )}
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
            >
              open
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
