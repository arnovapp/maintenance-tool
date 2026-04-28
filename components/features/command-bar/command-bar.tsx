"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Loader2, X } from "lucide-react";

import { partSearchResponseSchema } from "@/lib/ai/part-search/schema";

import { PartSearchResults } from "../part-search/results";

const PLACEHOLDER = "Type a part, describe a job, or describe a vendor email...";

/**
 * Home command bar — the single point of entry per design-guide.
 * T0.4 shipped the input. This file completes T1.1 by wiring submit
 * to /api/search/parts and rendering streamed results below the input.
 *
 * Cmd+K behavior:
 *   - On home (`/`) → focus the input (handled by the global listener).
 *   - From any other page → navigate to `/?cmd=1`. The mount effect below
 *     reads that param, focuses, and replaces the URL back to `/`.
 */
export function CommandBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState("");

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/search/parts",
    schema: partSearchResponseSchema,
  });

  // Honor `?cmd=1` arrival: focus and clear the param.
  useEffect(() => {
    if (searchParams?.get("cmd") === "1") {
      inputRef.current?.focus();
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Listen for the focus event from the global Cmd+K handler when
  // the user presses Cmd+K while already on `/`.
  useEffect(() => {
    const onFocus = () => inputRef.current?.focus();
    window.addEventListener("maintenance:focus-command-bar", onFocus);
    return () => window.removeEventListener("maintenance:focus-command-bar", onFocus);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < 2) return;
    submit({ input_text: trimmed });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="command-bar-input" className="sr-only">
          Search parts, contractors, or compose a vendor email
        </label>
        <div className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 flex items-center gap-2 rounded-md border px-3 py-2 transition-colors focus-within:ring-2">
          <input
            id="command-bar-input"
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Esc clears the input. If text is already empty, blur instead
              // so the user can use Esc to escape the input entirely.
              if (e.key === "Escape") {
                if (text.length > 0) {
                  e.preventDefault();
                  setText("");
                } else {
                  inputRef.current?.blur();
                }
              }
            }}
            placeholder={PLACEHOLDER}
            disabled={isLoading}
            className="placeholder:text-muted-foreground/70 w-full bg-transparent text-base outline-none disabled:opacity-60"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Cancel search"
              className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <kbd className="text-muted-foreground border-border bg-muted hidden h-6 items-center rounded border px-1.5 font-mono text-[11px] select-none sm:inline-flex">
              ⌘K
            </kbd>
          )}
        </div>
        {isLoading && (
          <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Searching…
          </p>
        )}
      </form>

      {!object && !isLoading && !error && (
        // Empty state — design-guide: "say what to do next." A concrete
        // example of a good first search keeps the home screen useful
        // before the recent-searches feed has anything to show.
        <p className="text-muted-foreground/70 text-xs">
          Try{" "}
          <button
            type="button"
            onClick={() => {
              setText("drain pump for Hobart CL44e dishwasher");
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground font-mono underline-offset-2 hover:underline"
          >
            drain pump for Hobart CL44e dishwasher
          </button>
          .{" "}
          <kbd className="border-border bg-muted ml-1 inline-flex h-4 items-center rounded border px-1 font-mono text-[10px] select-none">
            Esc
          </kbd>{" "}
          clears the input.
        </p>
      )}

      <PartSearchResults data={object} isLoading={isLoading} error={error} />
    </div>
  );
}
