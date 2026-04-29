import Link from "next/link";

import { createClient } from "@/lib/db/server";

export const metadata = { title: "Drafts — Maintenance" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  ignored: "Ignored",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function DraftsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_draft")
    .select("id, recipient_email, subject, status, updated_at, vendor_id")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-foreground text-lg font-medium">Drafts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Email drafts. Review, edit, and (for now) copy-paste into Gmail. Direct push to Gmail
          Drafts comes when T3.1 lands.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load drafts.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No drafts yet. Drafts get created from the contractor finder ({" "}
          <Link href="/vendors/find" className="text-foreground underline-offset-2 hover:underline">
            /vendors/find
          </Link>{" "}
          ) when you click &quot;Draft email&quot; on a result row.
        </p>
      ) : (
        <ul className="border-border divide-border bg-card divide-y rounded-md border">
          {data.map((d) => (
            <li key={d.id}>
              <Link
                href={`/drafts/${d.id}`}
                className="hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:ring-ring flex flex-col gap-0.5 px-3 py-2 transition-colors focus-visible:ring-1 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-sm">
                    {d.subject || "(no subject)"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {d.recipient_email || "(no recipient yet)"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground border-border rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase">
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {formatDate(d.updated_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
