import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { DraftEditor } from "@/components/features/drafts/draft-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<{ title: string }> {
  return { title: "Draft — Maintenance" };
}

export default async function DraftDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_draft")
    .select("id, recipient_email, subject, body, status, vendor_id, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-[720px] px-4 py-12">
        <Link
          href="/drafts"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
        >
          ← Back to drafts
        </Link>
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          <p className="font-medium">Couldn&apos;t load this draft.</p>
          <p className="mt-1 text-xs opacity-80">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[720px] px-4 py-12">
      <Link
        href="/drafts"
        className="text-muted-foreground hover:text-foreground mb-6 inline-block text-xs underline-offset-2 hover:underline"
      >
        ← Back to drafts
      </Link>
      <DraftEditor
        id={data.id}
        initial={{
          recipient_email: data.recipient_email,
          subject: data.subject,
          body: data.body,
          status: data.status,
        }}
      />
    </main>
  );
}
