# Product Requirements Document

**Project:** The Maintenance Tool
**Version:** 1.0 (v1 scope)
**Last updated:** Project kickoff
**Owner:** Single user / builder

---

## 1. Problem

A facilities maintenance manager at a commercial spa spends a significant portion of each week on low-leverage research and communication work:

- Sourcing odd or obscure parts for broken equipment (dishwashers, pumps, HVAC, sauna heaters, pool equipment)
- Identifying and vetting local contractors for custom jobs (e.g., 140" solid timber countertops that can't be bought pre-made)
- Drafting outreach emails to vendors and contractors for quotes, parts orders, and follow-ups
- Re-doing research he's already done because there's no system to capture the results

Each of these tasks is individually small but recurs daily. There is no existing tool that handles them in a unified way. Commercial CMMS products focus on work order tracking and don't do sourcing or outreach. Generic AI assistants can search and draft but have no memory of his equipment, vendors, or history.

## 2. Goals

**Primary goal:** Reclaim meaningful time per week from sourcing, researching, and drafting by handing those tasks to an AI agent that remembers context.

**Secondary goals:**

- Build durable institutional knowledge about the facility's equipment and vendor relationships
- Create a foundation that can extend into inventory, preventive maintenance, and compliance tracking later
- Produce a tool polished enough that it could become a commercial product if usage validates it

**Non-goals for v1:**

- Multi-user support
- Mobile-native apps (responsive web is sufficient)
- Replacing existing accounting, scheduling, or CMMS tools
- Autonomous action without human approval

## 3. Users

**v1 user:** One person. The builder. He is the maintenance manager at a commercial spa. He uses the tool daily from a work computer (Chrome, Google account signed in). He is technically literate but not a developer.

**Potential future users (v2+):** Other maintenance managers at similar facilities (spas, hotels, hospitality, multi-unit properties, schools). Do not design for them yet. Let v1 inform what they would need.

## 4. Core user stories for v1

### Part sourcing

> As a maintenance manager, I want to type or photograph a broken part, so I can quickly find suppliers, prices, and part numbers without 45 minutes of Googling.

**Inputs:** Free-text description, OR photo upload (part, nameplate, model sticker)
**Outputs:** A table of 3–5 supplier options with part number, price, availability, shipping estimate, and source URL.
**Acceptance:** Under 15 seconds from submit to results; at least 3 usable results for common parts; part numbers verified against model when a model is known.

### Contractor and vendor finding

> As a maintenance manager, I want to describe a job (e.g., "find local millwork shops that can do 140" solid timber countertops") and get a shortlist of viable local businesses with relevant capability.

**Inputs:** Free-text job description, optional location (defaults to saved location)
**Outputs:** A shortlist of 3–5 local businesses with website, contact info, evidence of relevant capability, and a draft outreach email for each.
**Acceptance:** Results are genuinely local; capability evidence is pulled from their actual site, not invented; draft emails are personalized to each business, not templated.

### Vendor outreach drafting

> As a maintenance manager, I want the tool to draft personalized emails for parts orders, quote requests, and follow-ups, so I can send them with one click after a quick review.

**Inputs:** Natural language instruction plus context (a part search result, a vendor record, a project)
**Outputs:** An email draft saved to the user's Gmail Drafts folder, ready to review and send.
**Acceptance:** Drafts are personalized, not templated; they include relevant attachments (specs, part numbers, drawings) where applicable; nothing sends without explicit human action.

## 5. Data model (v1 minimum)

Even in v1 we introduce the entities that future features will hang off:

- **Equipment** — every major piece of gear at the facility. Fields: name, type, manufacturer, model, serial, install date, location, notes, photos.
- **Vendor** — any supplier, contractor, or business contact. Fields: name, type (supplier/contractor/service), contact info, specialty, notes, history.
- **PartSearch** — a saved record of a sourcing task. Fields: input (text/photo), results, chosen result, linked equipment, date.
- **EmailDraft** — a record of drafts we've generated. Fields: recipient, subject, body, attachments, linked vendor, linked context, status (draft/sent/ignored).

These are scaffolding. The user won't directly manage "equipment records" in v1 — equipment is created incidentally when he searches for parts for something new. But the schema is ready for v2+ features (inventory, PM schedule, manuals, etc.) without migration pain.

## 6. Constraints

- **Work computer usage:** Must run in Chrome, no install required, no admin privileges needed. Uses the user's existing Google account for any Google integrations.
- **Single user:** No auth in v1. Site is protected by Vercel password and/or IP allowlist. Plan for Supabase Auth migration in v2.
- **Data residency:** No specific requirements identified. The spa is comfortable with cloud-hosted data on standard providers (Vercel, Supabase).
- **Budget:** Free tier of all services is expected to cover v1 usage. Cost should stay under $25/month through at least month 3.

## 7. Success metrics

Measured at 30, 60, and 90 days of usage.

| Metric                              | Baseline (pre-tool)                    | Target at 90 days                                                                     |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| Hours/week on part sourcing         | TBD (capture in `baseline-metrics.md`) | 50% reduction                                                                         |
| Hours/week on contractor research   | TBD                                    | 50% reduction                                                                         |
| Hours/week on vendor email drafting | TBD                                    | 60% reduction                                                                         |
| Part searches per week              | TBD                                    | ≥ baseline (the tool should not change how often he searches, only how long it takes) |
| Tool sessions per week              | 0                                      | ≥ 20 (tool becomes a habit, not an occasional thing)                                  |

These numbers are the fork in the road at 90 days: if they're hit, productize. If not, reassess.

## 8. Risks

1. **Scope creep during the build.** Mitigation: locked v1 scope, backlog for everything else, PR review gate.
2. **Data entry burden.** Risk that the tool requires too much setup to be useful. Mitigation: equipment and vendors are created incidentally from use, not as a mandatory upfront step.
3. **Sourcing quality.** LLM-based part sourcing may return hallucinated part numbers or dead URLs. Mitigation: cross-verify part numbers against manufacturer sites where possible; show source URLs so the user can sanity-check; track result quality in a simple feedback mechanism.
4. **Tool abandonment after novelty.** Mitigation: the sourcing flow has to be genuinely faster than Google from week one. If it's not, fix speed before adding features.
5. **Agent build drift.** Agents working 24/7 may produce inconsistent code, reinvent patterns, or expand scope. Mitigation: strict `CLAUDE.md`, PR reviews, small tasks with clear acceptance criteria.

## 9. Out of scope for v1 (documented here to prevent re-litigation)

All of the following are acknowledged valuable and deferred to v2+. See `v2-backlog.md` for the full list.

Inventory tracking • Preventive maintenance schedule • License/permit tracking • Paint and finish registry • Manual and documentation library • Procedure/SOP library • Password and code vault • Architectural drawing library and send-to-contractor action • Work order / issue tracking from staff • Vendor performance rating • Budget and spend tracking • Warranty tracking • SDS library • Utility meter readings • Shift/handover notes • Asset condition photo history • Insurance claim support • Ask-anything chat across the knowledge base • Voice input • Autonomous email sending • Mobile app
