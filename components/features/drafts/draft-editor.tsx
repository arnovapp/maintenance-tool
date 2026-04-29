"use client";

import { useActionState, useTransition } from "react";

import { deleteDraft, updateDraft, type DraftFormState } from "@/app/drafts/actions";

interface DraftEditorProps {
  id: string;
  initial: {
    recipient_email: string;
    subject: string;
    body: string;
    status: "draft" | "sent" | "ignored";
  };
}

const inputCls =
  "border-input bg-background focus-within:border-ring focus-within:ring-ring/30 w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-within:ring-2";

export function DraftEditor({ id, initial }: DraftEditorProps) {
  const updateAction = updateDraft.bind(null, id);
  const [state, formAction, isPending] = useActionState<DraftFormState | undefined, FormData>(
    updateAction,
    undefined,
  );
  const [deletePending, startDelete] = useTransition();

  const fieldError = (name: string): string | undefined => {
    if (!state || state.ok !== false) return undefined;
    return state.fieldErrors[name]?.[0];
  };

  const onDelete = () => {
    if (
      !window.confirm(
        "Delete this draft? This cannot be undone — drafts marked 'sent' that you actually sent in Gmail will still be in Gmail; only this local record is removed.",
      )
    ) {
      return;
    }
    startDelete(async () => {
      await deleteDraft(id);
    });
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-foreground text-lg font-medium">Draft</h1>
        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={initial.status}
            className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="ignored">Ignored</option>
          </select>
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 inline-flex h-9 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-60"
          >
            {deletePending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {state && !state.ok && state.message && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm"
        >
          {state.message}
        </div>
      )}

      <label htmlFor="recipient_email" className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">To</span>
        <input
          id="recipient_email"
          name="recipient_email"
          type="email"
          defaultValue={initial.recipient_email}
          placeholder="recipient@example.com"
          autoComplete="off"
          className={inputCls}
        />
        {fieldError("recipient_email") && (
          <span className="text-destructive text-xs">{fieldError("recipient_email")}</span>
        )}
      </label>

      <label htmlFor="subject" className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">Subject *</span>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          defaultValue={initial.subject}
          autoComplete="off"
          className={inputCls}
        />
        {fieldError("subject") && (
          <span className="text-destructive text-xs">{fieldError("subject")}</span>
        )}
      </label>

      <label htmlFor="body" className="flex flex-col gap-1.5">
        <span className="text-foreground text-xs font-medium">Body *</span>
        <textarea
          id="body"
          name="body"
          rows={14}
          required
          defaultValue={initial.body}
          className={`${inputCls} resize-y font-sans leading-relaxed`}
        />
        {fieldError("body") && (
          <span className="text-destructive text-xs">{fieldError("body")}</span>
        )}
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {state?.ok === true && !isPending && (
          <span className="text-muted-foreground text-xs">Saved.</span>
        )}
      </div>

      <p className="text-muted-foreground/70 text-xs">
        Once T3.1 (Gmail OAuth) lands, marking a draft &quot;sent&quot; will push it to your Gmail
        Drafts folder for one-click send. For now this stays local — copy-paste into Gmail to
        actually send.
      </p>
    </form>
  );
}
