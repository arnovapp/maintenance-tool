"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Loader2, X } from "lucide-react";

import { contractorSearchResponseSchema } from "@/lib/ai/contractor-search/schema";

import { ContractorSearchResults } from "./results";

const PLACEHOLDER =
  "Describe the job — e.g., 'find local millwork shops that can do 140-inch solid timber countertops'";

export function ContractorFinder() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/search/contractors",
    schema: contractorSearchResponseSchema,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 5) return;
    setSubmittedQuery(trimmed);
    submit({ input_text: trimmed });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="contractor-finder-input" className="sr-only">
          Describe the contractor or service you need
        </label>
        <div className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 flex flex-col gap-2 rounded-md border px-3 py-2 transition-colors focus-within:ring-2">
          <textarea
            id="contractor-finder-input"
            ref={inputRef}
            rows={3}
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl/Cmd+Enter submits.
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
              if (e.key === "Escape" && text.length > 0) {
                e.preventDefault();
                setText("");
              }
            }}
            placeholder={PLACEHOLDER}
            disabled={isLoading}
            className="placeholder:text-muted-foreground/70 w-full resize-y bg-transparent text-base outline-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground/70 text-xs">
              <kbd className="border-border bg-muted inline-flex h-4 items-center rounded border px-1 font-mono text-[10px] select-none">
                ⌘ Enter
              </kbd>{" "}
              to search
            </span>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label="Cancel search"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                  <X className="h-3 w-3" aria-hidden />
                  Cancel
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={text.trim().length < 5}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  Search
                </button>
              )}
            </div>
          </div>
        </div>
        {isLoading && (
          <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Searching local businesses…
          </p>
        )}
      </form>

      {!object && !isLoading && !error && (
        <p className="text-muted-foreground/70 text-xs">
          Be specific — include scope, dimensions, materials, and any quirks. The model uses {`"`}
          capability evidence{`"`} from each business{`'`}s site to decide whether they actually do
          this kind of work.
        </p>
      )}

      <ContractorSearchResults
        data={object}
        isLoading={isLoading}
        error={error}
        jobDescription={submittedQuery}
      />
    </div>
  );
}
