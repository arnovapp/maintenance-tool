"use client";

import { ExternalLink, Mail, Phone } from "lucide-react";

import type { ContractorSearchResponse } from "@/lib/ai/contractor-search/schema";
import { cn } from "@/lib/utils";

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

interface ContractorSearchResultsProps {
  data: DeepPartial<ContractorSearchResponse> | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "high",
  medium: "med",
  low: "low",
};

export function ContractorSearchResults({ data, isLoading, error }: ContractorSearchResultsProps) {
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
    <section aria-label="Contractor search results" className="flex flex-col gap-3">
      {understood && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">Searching for:</span> {understood}
        </p>
      )}

      {results.length > 0 && (
        <ul className={cn("border-border divide-border bg-card divide-y rounded-md border")}>
          {results.map((r, i) => (
            <li
              key={`${r?.name ?? "row"}-${i}`}
              className="hover:bg-accent/40 group flex flex-col gap-2 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">
                      {r?.name ?? "…"}
                    </span>
                    {r?.confidence && (
                      <span className="text-muted-foreground border-border rounded border px-1 py-0.5 font-mono text-[10px] uppercase">
                        {CONFIDENCE_LABEL[r.confidence] ?? r.confidence}
                      </span>
                    )}
                  </div>
                  {r?.specialty && <p className="text-muted-foreground text-xs">{r.specialty}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs">
                  {r?.website && (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                    >
                      site
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
              </div>

              {r?.capability_evidence && (
                <blockquote className="text-foreground/80 border-border/60 border-l-2 pl-3 text-xs italic">
                  {r.capability_evidence}
                </blockquote>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {r?.email && (
                  <a
                    href={`mailto:${r.email}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                  >
                    <Mail className="h-3 w-3" aria-hidden />
                    {r.email}
                  </a>
                )}
                {r?.phone && (
                  <a
                    href={`tel:${r.phone.replace(/\s+/g, "")}`}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                  >
                    <Phone className="h-3 w-3" aria-hidden />
                    {r.phone}
                  </a>
                )}
                {r?.distance_note && (
                  <span className="text-muted-foreground">{r.distance_note}</span>
                )}
              </div>

              {r?.notes && <p className="text-muted-foreground/80 text-xs">{r.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      {isLoading && results.length < 3 && (
        <ul
          aria-hidden
          className="border-border divide-border divide-y rounded-md border opacity-60"
        >
          {Array.from({ length: 3 - results.length }).map((_, i) => (
            <li key={i} className="flex flex-col gap-2 px-3 py-3">
              <div className="bg-muted h-3 w-40 rounded" />
              <div className="bg-muted/60 h-3 w-64 rounded" />
              <div className="bg-muted/40 h-3 w-32 rounded" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
