import Link from "next/link";

import { ContractorFinder } from "@/components/features/contractor-search/contractor-finder";

export const metadata = { title: "Find a contractor — Maintenance" };

export default function FindContractorPage() {
  return (
    <main className="mx-auto max-w-[820px] px-4 py-12">
      <Link
        href="/vendors"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to vendors
      </Link>
      <header className="mb-6">
        <h1 className="text-foreground text-lg font-medium">Find a contractor</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-powered search for local businesses with capability evidence pulled from their
          websites. Results land here only — saving and drafting outreach is the next step (T2.3).
        </p>
      </header>
      <ContractorFinder />
    </main>
  );
}
