"use client";

import { ExternalLink } from "lucide-react";

import type { PartSearchResponse } from "@/lib/ai/part-search/schema";
import { cn } from "@/lib/utils";

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

interface PartSearchResultsProps {
  data: DeepPartial<PartSearchResponse> | undefined;
  isLoading: boolean;
  error: Error | undefined;
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
 * Streaming-aware results renderer for the part-sourcing flow.
 *
 * `data` is the partial structured object produced by useObject — fields
 * may be undefined while the stream is in flight. We render whatever has
 * arrived so far rather than waiting for the full payload, which is the
 * "streaming AI responses are exempt from skeleton-only loading" rule
 * in design-guide.
 */
export function PartSearchResults({ data, isLoading, error }: PartSearchResultsProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
      >
        <p className="font-medium">Search failed.</p>
        <p className="mt-1 text-xs opacity-80">{error.message}</p>
      </div>
    );
  }

  const results = data?.results ?? [];
  const understood = data?.query_understood;

  if (!isLoading && results.length === 0 && !understood) return null;

  return (
    <section aria-label="Part search results" className="flex flex-col gap-3">
      {understood && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">Searching for:</span> {understood}
        </p>
      )}

      {results.length > 0 && (
        <ul className={cn("border-border divide-border bg-card divide-y rounded-md border")}>
          {results.map((r, i) => (
            <li
              key={`${r?.part_number ?? "row"}-${i}`}
              className="hover:bg-accent/40 group flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                    {r?.part_number ?? "…"}
                  </code>
                  {r?.confidence && (
                    <span className="text-muted-foreground border-border rounded border px-1 py-0.5 font-mono text-[10px] uppercase">
                      {CONFIDENCE_LABEL[r.confidence] ?? r.confidence}
                    </span>
                  )}
                </div>
                <p className="text-foreground/90 truncate text-sm">{r?.supplier ?? "…"}</p>
                {r?.notes && <p className="text-muted-foreground text-xs">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-0">
                <span className="text-foreground font-mono text-sm">{formatCAD(r?.price_cad)}</span>
                {r?.availability && (
                  <span className="text-muted-foreground text-xs">{r.availability}</span>
                )}
                {r?.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                  >
                    open
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isLoading && results.length < 3 && (
        // Skeleton rows for whatever results haven't yet arrived. Per
        // design-guide: skeletons over spinners — show the shape of what's
        // coming.
        <ul
          aria-hidden
          className="border-border divide-border divide-y rounded-md border opacity-60"
        >
          {Array.from({ length: 3 - results.length }).map((_, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-2">
              <div className="flex flex-col gap-1">
                <div className="bg-muted h-3 w-32 rounded" />
                <div className="bg-muted/60 h-3 w-48 rounded" />
              </div>
              <div className="bg-muted h-3 w-16 rounded" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
