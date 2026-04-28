"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Global keyboard handler: ⌘K / Ctrl+K focuses the home command bar
 * from anywhere in the app.
 *
 *   - On `/` → dispatch a custom event the CommandBar listens for and focuses.
 *   - Off `/` → push to `/?cmd=1`; CommandBar's mount effect picks that up.
 */
export function CmdKListener() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey &&
        !event.shiftKey;
      if (!isCmdK) return;

      // Don't hijack from inputs the user is intentionally typing into,
      // unless the focused element IS the command bar (allow re-focus).
      const target = event.target as HTMLElement | null;
      const focusedIsCommandBar =
        target?.id === "command-bar-input" || target?.closest("form[role=search]");

      if (target && !focusedIsCommandBar && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
        return;
      }

      event.preventDefault();
      if (pathname === "/") {
        window.dispatchEvent(new CustomEvent("maintenance:focus-command-bar"));
      } else {
        router.push("/?cmd=1");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pathname, router]);

  return null;
}
