"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, Save } from "lucide-react";

import { draftContractorEmail, saveContractorAsVendor } from "@/app/vendors/find/actions";
import type { ContractorSearchResult } from "@/lib/ai/contractor-search/schema";

interface ContractorResultActionsProps {
  /** The contractor result the user is acting on. */
  result: ContractorSearchResult;
  /** Original search query — feeds the email-drafting prompt. */
  jobDescription: string;
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saved"; vendorId: string }
  | { kind: "error"; reason: string };

type DraftState =
  | { kind: "idle" }
  | { kind: "drafted"; draftId: string }
  | { kind: "error"; reason: string };

export function ContractorResultActions({ result, jobDescription }: ContractorResultActionsProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [draftState, setDraftState] = useState<DraftState>({ kind: "idle" });
  const [savePending, startSave] = useTransition();
  const [draftPending, startDraft] = useTransition();

  const onSave = () => {
    setSaveState({ kind: "idle" });
    startSave(async () => {
      const out = await saveContractorAsVendor({
        name: result.name,
        email: result.email,
        phone: result.phone,
        website: result.website,
        specialty: result.specialty,
        notes: result.capability_evidence
          ? `Capability evidence captured: ${result.capability_evidence}`
          : null,
      });
      if (out.ok) {
        setSaveState({ kind: "saved", vendorId: out.vendorId });
      } else {
        setSaveState({ kind: "error", reason: out.reason });
      }
    });
  };

  const onDraft = () => {
    setDraftState({ kind: "idle" });
    startDraft(async () => {
      const vendorId = saveState.kind === "saved" ? saveState.vendorId : null;
      const out = await draftContractorEmail({
        contractorName: result.name,
        contractorEmail: result.email,
        jobDescription,
        specialty: result.specialty,
        capabilityEvidence: result.capability_evidence,
        vendorId,
      });
      if (out.ok) {
        setDraftState({ kind: "drafted", draftId: out.draftId });
        // Open the draft for review.
        router.push(`/drafts/${out.draftId}`);
      } else {
        setDraftState({ kind: "error", reason: out.reason });
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <button
        type="button"
        onClick={onSave}
        disabled={savePending || saveState.kind === "saved"}
        className="border-input bg-background text-foreground hover:bg-accent/40 focus-visible:ring-ring inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
      >
        {saveState.kind === "saved" ? (
          <>
            <Check className="h-3 w-3" aria-hidden /> Saved
          </>
        ) : (
          <>
            <Save className="h-3 w-3" aria-hidden />
            {savePending ? "Saving…" : "Save vendor"}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onDraft}
        disabled={draftPending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:opacity-60"
      >
        <Mail className="h-3 w-3" aria-hidden />
        {draftPending ? "Drafting…" : draftState.kind === "drafted" ? "Re-draft" : "Draft email"}
      </button>

      {saveState.kind === "error" && (
        <span role="alert" className="text-destructive text-xs">
          {saveState.reason}
        </span>
      )}
      {draftState.kind === "error" && (
        <span role="alert" className="text-destructive text-xs">
          {draftState.reason}
        </span>
      )}
    </div>
  );
}
