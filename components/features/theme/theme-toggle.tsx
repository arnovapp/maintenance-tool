"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";

/**
 * Two-state toggle (dark ↔ light). The provider also supports "system",
 * but the v1 toggle keeps the surface small per design-guide
 * ("complexity is a cost"). System mode can be re-introduced if a user
 * actually wants it.
 */
export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none"
    >
      {resolved === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
