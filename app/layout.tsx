import type { Metadata } from "next";

import { CmdKListener } from "@/components/features/keyboard/cmd-k-listener";
import { TopNav } from "@/components/features/nav/top-nav";
import { ThemeProvider } from "@/components/features/theme/theme-provider";
import { ThemeScript } from "@/components/features/theme/theme-script";

import "./globals.css";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Internal tooling for facility maintenance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The `dark` class is applied by `<ThemeScript />` before paint,
  // so the SSR markup omits it and `suppressHydrationWarning` prevents
  // the unavoidable html-attr mismatch warning. See design-guide:
  // "Dark mode is the default."
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <ThemeProvider>
          <CmdKListener />
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
