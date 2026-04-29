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

### Building → location → part hierarchy

Real facilities are not flat. A spa might have multiple buildings (treatment wing, admin, mechanical), each with named locations (bistro, lobby, sauna, treatment room 4, hot-tub mechanical room). Equipment and on-hand parts belong to a specific location, not floated at the facility level. Adding a building or a location should be a low-ceremony action — type a name, save. Once the tree exists, every equipment record and every inventory entry asks "which location?" by default. Captured 2026-04-28 from real usage feedback after T1.2 photo input shipped: the user wanted to file searched parts back to where they live.

### Equipment list filter by location

Small polish on T4.1 once locations exist: the /equipment page gets a dropdown ("All / Bistro / Lobby / Treatment room 4 / …") that filters the list. Two-line implementation once the location data model is real. Captured 2026-04-28; deferred until the location hierarchy lands so we don't ship a dropdown that filters nothing.

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

### Save part-search result to a location's inventory

On any part-search result row, an "add to inventory" action that asks "which location?" and creates an inventory entry (part number, supplier, on-hand count starts at the quantity ordered). Closes the loop between sourcing (Bucket 4) and inventory (Bucket 3): the part you just sourced goes straight into the building/location/inventory tree without a copy-paste step. Depends on Building → location → part hierarchy and Inventory and stock tracking. Captured 2026-04-28.

### Procurement workflow

Multi-step approvals if/when this becomes a multi-user tool.

---

## Cross-bucket / system-level

### Insurance claim support

"Generate incident report" bundles relevant equipment history, photos, work orders, and documentation into a claim-ready PDF. High-value the day it's actually needed.

### Gmail OAuth and Drafts integration (Phase 3 from task-breakdown)

Originally planned as v1 Phase 3 but deferred 2026-04-28 because the arnova.app Google Workspace org policy blocks Google Cloud project creation for `daniel@arnova.app` (the `resourcemanager.projects.create` permission is denied at both the org and "No organization" levels). Picking this up requires unblocking that — either by using a separate personal Google account for the OAuth credentials (cleanest, since OAuth cred ownership doesn't have to match the eventual user-account email being authorized), or by escalating Workspace admin and granting the Project Creator role on the arnova.app org.

What lands when this is unblocked:

- T3.1 OAuth flow — the user clicks "Connect Gmail" once; tokens stored in Supabase.
- T3.2 — drafts pushed directly to the user's Gmail Drafts folder; tool stores the gmail_draft_id.
- T3.3 — /drafts inbox shows status synced with Gmail (sent / drafted / ignored).

In the meantime, /drafts works as a local-only review surface: generated drafts live in the email_draft table, the user reviews + edits in /drafts/[id], then copy-pastes into Gmail to actually send.

### Multi-user / team features

Second user, then roles and permissions. Required before showing to anyone outside the builder. Probably comes after productization decision at 90 days.

### Per-facility branding (wordmark from the user's business name)

The top-nav wordmark currently reads "Maintenance" — a deliberately neutral placeholder per design-guide. When the tool is productized for users beyond the builder, the wordmark should default to the user's facility name (e.g. "Spa Lakeshore", "Elements Hotel"), captured during the same onboarding step that records the saved facility location used by contractor finding. Falls back to "Maintenance" when no facility name is set. Pre-positions the tool to feel "yours" the moment a new user logs in. Brand tokens already isolated per design-guide section "Placeholder for Arnova branding," so this is a small swap once the multi-user / settings surface exists. Captured 2026-04-28.

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
