"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyablePartNumberProps {
  partNumber: string | undefined;
  className?: string;
}

/**
 * Click-to-copy badge for a part number.
 *
 * Renders as a real <button> so it's keyboard-reachable (Enter/Space
 * activate). On a successful copy, swaps in a Check icon for ~1.5s so
 * the user gets confirmation without a toast.
 *
 * Falls back to a non-interactive <code> when navigator.clipboard
 * isn't available (older browsers, http://-served pages) so the value
 * still renders — just without the affordance.
 *
 * The Copy icon stays at opacity-0 by default and reveals on row hover
 * (the parent <li> in results.tsx carries `group`); avoids visual noise
 * in dense result lists.
 */
export function CopyablePartNumber({ partNumber, className }: CopyablePartNumberProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount in case user navigates away mid-cooldown.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // No part number yet (still streaming) — render the placeholder.
  if (!partNumber) {
    return (
      <code
        className={cn(
          "bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs",
          className,
        )}
      >
        …
      </code>
    );
  }

  const clipboardSupported = typeof navigator !== "undefined" && Boolean(navigator.clipboard);

  // No clipboard support: render the value but skip the button shell.
  if (!clipboardSupported) {
    return (
      <code
        className={cn(
          "bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs",
          className,
        )}
      >
        {partNumber}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(partNumber);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Quiet failure — the user can still triple-click + copy manually.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy part number ${partNumber}`}
      title={copied ? "Copied" : "Copy"}
      className={cn(
        "bg-muted text-foreground hover:bg-muted/70 focus-visible:ring-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs transition-colors focus-visible:ring-1 focus-visible:outline-none",
        className,
      )}
    >
      <span>{partNumber}</span>
      {copied ? (
        <Check className="h-3 w-3 opacity-70" aria-hidden />
      ) : (
        <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" aria-hidden />
      )}
    </button>
  );
}
