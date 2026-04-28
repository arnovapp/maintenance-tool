"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { ThemeToggle } from "../theme/theme-toggle";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/searches", label: "Searches" },
  { href: "/equipment", label: "Equipment" },
  { href: "/vendors", label: "Vendors" },
  { href: "/drafts", label: "Drafts" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-12 max-w-screen-xl items-center gap-6 px-4"
      >
        {/* Wordmark — neutral text per design-guide; swappable when Arnova brand finalizes */}
        <Link
          href="/"
          className="text-foreground hover:text-foreground/80 font-mono text-sm font-medium tracking-tight transition-colors"
        >
          Maintenance
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring rounded-md px-2 py-1 transition-colors focus-visible:ring-1 focus-visible:outline-none",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
