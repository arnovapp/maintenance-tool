"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PLACEHOLDER =
  "Type a part, describe a job, or describe a vendor email...";

/**
 * Home command bar — the single point of entry per design-guide.
 * T0.4 ships the input only; T1.1 wires it to the part-search API.
 *
 * Cmd+K behavior:
 *   - On home (`/`) → focus the input directly (handled by the global listener).
 *   - From any other page → navigate to `/?cmd=1`. This component reads that
 *     param on mount, focuses, and replaces the URL back to `/` so the param
 *     is one-shot.
 */
export function CommandBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Honor `?cmd=1` arrival: focus and clear the param.
  useEffect(() => {
    if (searchParams?.get("cmd") === "1") {
      inputRef.current?.focus();
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  // Listen for the focus event dispatched by the global Cmd+K handler
  // when the user presses Cmd+K while already on `/`.
  useEffect(() => {
    const onFocus = () => inputRef.current?.focus();
    window.addEventListener("maintenance:focus-command-bar", onFocus);
    return () =>
      window.removeEventListener("maintenance:focus-command-bar", onFocus);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Wired to the part-search API in T1.1. No-op for now.
      }}
      className="w-full"
      role="search"
    >
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
          placeholder={PLACEHOLDER}
          className="placeholder:text-muted-foreground/70 w-full bg-transparent text-base outline-none"
        />
        <kbd className="text-muted-foreground border-border bg-muted hidden h-6 select-none items-center rounded border px-1.5 font-mono text-[11px] sm:inline-flex">
          ⌘K
        </kbd>
      </div>
      <p className="text-muted-foreground/70 mt-2 text-xs">
        Submitting will be wired up in T1.1 (part sourcing flow).
      </p>
    </form>
  );
}
