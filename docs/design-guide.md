# Design Guide

This guide defines the visual and UX direction for The Maintenance Tool. It exists to keep agent-produced UI consistent and to avoid the "generic AI app" aesthetic.

---

## Design principles

1. **Utility over beauty.** This is a tool used at work, in pump rooms, next to broken equipment. It should feel like a well-made pocket knife, not a showpiece.
2. **Speed is the primary design metric.** If a design choice makes the tool feel slower — pre-loading animations, sequential reveals, fancy transitions that cost milliseconds — cut it. Speed is the feature.
3. **Dark mode is the default.** The user works in dim spaces. Light mode is available but not the default.
4. **Information density is fine.** Users need to scan results quickly. Don't pad tables with generous whitespace for aesthetics. Use real data density like a Bloomberg terminal, not a marketing page.
5. **No emoji, no AI tropes.** No sparkles, no robot icons, no "✨ powered by AI" flourishes. The AI is the engine, not the brand.
6. **Accessible by default.** Keyboard navigation works everywhere. Focus states are visible. Color is never the only signal. Contrast ratios meet WCAG AA at minimum.

## Visual language

### Foundation

- **Default mode:** Dark
- **Aesthetic:** Minimal, functional, dense, monochromatic with one accent color
- **Reference points:** Linear, Vercel dashboard, Raycast, GitHub CLI output, terminal-adjacent productivity tools

### Color (v1 neutral palette — revisit when Arnova brand finalizes)

The palette is deliberately plain. The goal is "looks like a serious tool, ready to be rebranded" not "definitely not Arnova."

Dark mode (default):

- Background: near-black, slight warmth (`#0B0B0C` or equivalent)
- Surface: raised surfaces one step lighter
- Border: subtle, low contrast
- Text primary: near-white, slight warmth
- Text secondary: ~60% opacity of primary
- Accent: a single functional accent (a clean blue-white, desaturated) used only for interactive affordances and the primary action
- Semantic colors: muted red for destructive/error, muted amber for warning, muted green for success. No saturated colors.

Use Tailwind's `zinc` or `neutral` scale as the base. The accent is a single custom color; everything else is gray.

Light mode:

- Mirror of dark mode. Not a priority but must not look broken.

### Typography

- **Sans:** System UI stack, weighted toward Inter if self-hosted — `Inter, system-ui, -apple-system, sans-serif`
- **Mono:** System mono stack — `ui-monospace, SFMono-Regular, Menlo, monospace` — used for part numbers, model numbers, codes, and anything that should be copy-pasteable as an identifier
- **Scale:** A tight type scale. Most UI is at a single body size. Headings step up sparingly. No display typography.
- **Line length:** Long-form text blocks cap at ~70 characters. Tables and data views ignore this.

### Layout

- Single-column desktop layout for the main input. Width caps around 720px for the input area.
- Results take the full width of the content area.
- Persistent top nav: Home / Searches / Equipment / Vendors / Drafts. Thin, quiet, text-only.
- No sidebar in v1. Add a sidebar if navigation complexity demands it in v2.

### Spacing

- Base unit: 4px
- Common spacing: 4, 8, 12, 16, 24, 32, 48. Rarely 64+. Avoid marketing-site generous padding.

### Components

- Use shadcn/ui primitives as the foundation. Accept defaults where they fit the principles above; customize where they lean too decorative.
- Buttons: rectangular, low radius (4–6px), two weights (primary, secondary/ghost). No gradients, no shadows beyond subtle.
- Inputs: flat, bordered, focus ring uses the accent color. Monospace for any field holding identifiers (part numbers, serials).
- Tables: dense, alternating row backgrounds subtle or absent, headers sticky on long results. Row hover reveals row actions.
- Cards: minimal. A card is a border and padding. No elevation.

### Icons

- Use Lucide icons (bundled with shadcn/ui).
- Single weight, neutral color, no decoration.
- Icons supplement text labels. Never icon-only buttons in v1 (accessibility, learnability).

### Motion

- Transitions are fast (100–150ms) or absent. No hero animations, no easing flourishes.
- Loading states: skeleton placeholders, no spinners, no animated dots. Show the shape of what's coming.
- Streaming AI responses are exempt — let the text flow as it generates, that's an honest signal of progress.

---

## UX patterns

### The home screen

A single command-bar input. Above it, a one-line greeting or status. Below it, recent searches as one-line entries. That's it. The user types or photographs and gets results. No dashboard, no widgets, no "welcome back" hero card.

### Results

- Results stream in as they arrive. Do not wait for the full set before showing anything.
- Each result is one row. Most relevant first. Users scan top-to-bottom.
- Per-result actions live on row hover/focus, not always-visible.
- Empty states say what to do next, not just "no results."

### Forms

- Server-validated, with inline error states.
- Submit feedback is immediate.
- Optimistic updates where the underlying operation is reliable; explicit pending states where it isn't.
- No multi-step wizards in v1. Every operation is one screen.

### Approval gates (the load-bearing pattern)

Any action that crosses a boundary — sends data outward, costs money, modifies an external system — shows the user exactly what will happen, then waits for a click.

Standard pattern:

1. Show a summary of the action (recipient, content, parameters)
2. Show a "Confirm" button as primary, "Cancel" as secondary
3. On confirm, execute and show outcome
4. On cancel, return to edit state with no destructive consequences

This pattern repeats across email drafting, vendor outreach, anything that pushes data into Gmail or external services. It is non-negotiable for v1.

### Keyboard shortcuts from day one

At minimum: `⌘K` / `Ctrl+K` to focus the main input from anywhere. `Esc` to close modals. Standard form navigation. Document shortcuts in a `?` help overlay.

## What this design is NOT

- Not a landing page. No hero sections, no marketing copy in the UI, no "Get started" animations.
- Not a consumer app. No onboarding tour, no empty-state mascots, no celebratory toasts for mundane actions.
- Not a playground for every shadcn component. Use the minimum set necessary. Complexity is a cost.
- Not a brand showcase (yet). When Arnova branding finalizes, the accent color and logomark get swapped. Nothing else should need to change.

## Placeholder for Arnova branding

When Arnova's brand is finalized, these tokens get replaced:

- Accent color (currently neutral blue-white, single value)
- Logomark (currently a plain text wordmark reading "Maintenance")
- Favicon (currently the default)
- Any marketing-adjacent surfaces (login page, share previews)

Keep these isolated in a single `/app/brand.ts` or equivalent so the rebrand is a file, not a refactor.
