import type { ReactNode } from "react";

interface PlaceholderPageProps {
  title: string;
  task: string;
  children?: ReactNode;
}

/**
 * Minimal placeholder used for routes whose real implementation lands in
 * later tasks. Kept intentionally bare — design-guide forbids marketing-ish
 * empty states. Tells the user what *will* be here and which task ships it.
 */
export function PlaceholderPage({ title, task, children }: PlaceholderPageProps) {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-foreground text-lg font-medium">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Placeholder. Real UI lands in {task}.</p>
      </div>
      {children}
    </main>
  );
}
