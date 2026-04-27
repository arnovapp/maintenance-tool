import { Suspense } from "react";

import { CommandBar } from "@/components/features/command-bar/command-bar";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 pt-16 pb-24 sm:pt-24">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">What do you need?</p>
      <Suspense fallback={null}>
        <CommandBar />
      </Suspense>
      {/* Recent searches will land here in T1.4. Intentionally empty in T0.4. */}
    </main>
  );
}
