# v2+ Backlog

Everything that came up in the brainstorm that is NOT in v1. Organized by the four buckets the tool serves:

1. **What do I need to do?** — tasks, reminders, compliance
2. **How do I do it?** — procedures, manuals, codes, documentation
3. **What do I have?** — inventory, equipment, vendors, history
4. **What do I need to get?** — sourcing, contractor outreach, quotes (this is v1)

Do not prioritize this list until v1 has been in use for 30 days. Priorities should emerge from real usage, not speculation.

---

## Bucket 1: What do I need to do?

### Preventive maintenance (PM) schedule

Recurring tasks tied to equipment — filter changes, PRV inspections, fire inspections, seasonal changeovers, HVAC belt replacements. Each has frequency, next-due date, linked procedure, linked parts, compliance status. Tool surfaces what's coming up, flags overdue items loudly, produces audit trails for compliance.

### License and permit tracking

Pool operator cert, electrical permits, business license, liability insurance, boiler cert, health authority permits. Each has expiry date, renewal lead time, issuing body, cost, documentation. Escalating reminders based on lead time (6 months / 3 months / 1 month / 1 week / overdue). Overdue state is loud and persistent.

### Work order / issue tracking

Staff can submit issues (via form or dedicated email address). Issues get triaged, assigned, tracked to completion. History per equipment reveals patterns ("this tap has been repaired 4 times in 6 months — replace it").

### Warranty tracking

Every major piece of equipment has warranty dates captured. Tool flags before expiry so known issues can be addressed under warranty. Warranty claim documentation auto-assembled from equipment record + work order history.

### Seasonal project templates

Multi-step recurring projects (winter shutdown, spring startup) as templates that spawn dated task lists when the season hits. Linked to procedures, parts, and scheduling.

---

## Bucket 2: How do I do it?

### Manual and documentation library

PDFs of manufacturer manuals attached to each equipment record. Claude-searchable, so "how do I reset the error on the Hobart" pulls from the manual. User annotations layer on top of manufacturer docs ("the bypass valve is actually behind the blue panel, not where the diagram shows").

### Procedure / SOP library

Tribal knowledge externalized. Pool drain procedures, winterization sequences, startup after power failure, valve-close orders. Built by narrating a procedure as you do it (voice-to-text), tool structures into a checklist with inline photos, you review and save.

### Paint and finish registry

Every surface at the facility tagged with its paint/stain/finish. Brand, color code, finish type, location, date applied, supplier, quantity remaining, application method. Search by location ("admin walls") or by product ("where did we use the Sansin cedar stain"). Photo-upload-to-match for sanity checking.

### Password and code vault

Equipment login codes, alarm codes, panel access codes, supplier portal logins. Encrypted at rest. Quick-access from the equipment record.

### Architectural drawing library

Floor plans, MEP drawings, as-builts, structural drawings — searchable, annotatable, sendable to contractors. "Send the dishwasher area drawings to this contractor" should be one click.

### SDS library

Safety data sheets per chemical/material on site. Search by product, by location, by hazard. Audit-ready.

---

## Bucket 3: What do I have?

### Equipment database (full version)

v1 has equipment records as scaffolding. v2+ fills them in with: full spec, manuals, photos, work order history, PM schedule, warranty info, parts list, replacement schedule, depreciation. The "ledger" of every major asset.

### Inventory and stock tracking

On-site inventory with par levels, low-stock alerts, reorder points, supplier links. Mobile-scan-to-deplete workflow. Surfaces "you're running low on these consumables that you'll need next week."

### Vendor performance rating

Auto-populated from quote history, response times, on-time delivery, problem rate. Surfaces preferred vendors first, flags problematic ones.

### Budget and spend tracking

Receipts and invoices linked to equipment, vendors, work orders. Spend-per-equipment lifetime cost. Flag when repair costs exceed replacement cost.

### Utility meter readings

Monthly water/electric/gas readings per facility. Trends. Anomaly detection ("water usage doubled last month, leak likely").

### Shift/handover notes

End-of-shift notes from staff, searchable by date, equipment, person. Surface "what happened while I was away."

### Asset condition photo history

Photo log per equipment over time. Compare current state to install state. Document deterioration before warranty claims.

---

## Bucket 4: What do I need to get? (v1 territory — these are extensions)

### Quote comparison

For larger purchases, send the same RFQ to multiple vendors, get responses back into the tool, compare side-by-side.

### Order tracking

After a part is ordered, track shipping, delivery, and confirm receipt. Auto-update equipment records.

### Procurement workflow

Multi-step approvals if/when this becomes a multi-user tool.

---

## Cross-bucket / system-level

### Insurance claim support

"Generate incident report" bundles relevant equipment history, photos, work orders, and documentation into a claim-ready PDF. High-value the day it's actually needed.

### Multi-user / team features

Second user, then roles and permissions. Required before showing to anyone outside the builder. Probably comes after productization decision at 90 days.

### Mobile-native app

Web-responsive is sufficient for v1. Native mobile is a substantial investment and should wait until the tool is productized and there's demand.

### Voice input

Narrate a procedure or a part request hands-free while working on equipment. Big quality-of-life win when actual hands are dirty.

### Ask-anything chat

A general "ask me anything about my facility" chat over the entire knowledge base. Comes only after the knowledge base has enough in it to be worth querying.

### Autonomous email sending

v1 drafts only. v2+ may permit certain low-risk auto-sends (e.g., "send this to the vendor we've used 12 times before") with explicit per-action permissions.

---

## Design principles for everything above

- Every feature hangs off an existing entity (equipment, vendor, location) — don't create new top-level concepts without strong justification
- Every feature preserves the approval-gate pattern unless explicitly promoted to autonomous
- Every feature has a data-entry cost; the design has to include how data enters the system without burden, not just how it's queried
- Every feature should be introducible without a migration nightmare — the v1 schema was chosen to accommodate this
