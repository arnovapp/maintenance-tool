import type { Metadata } from "next";
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
  // Dark mode is the default per docs/design-guide.md.
  // T0.4 will introduce the light/dark toggle and persist the user's choice.
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  );
}
