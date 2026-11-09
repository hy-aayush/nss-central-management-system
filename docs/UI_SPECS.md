# NSS Central Management System — UI & Design System Specification (v2)

> **Status:** authoritative for the UI layer as implemented in `src/app/globals.css`,
> `src/components/ui/*`, `src/components/shared/*` and the office shell.
> Business logic, routes, auth, and data structures are unchanged by this layer.

---

## 1. Principles & Design Aesthetic

- **Minimal Liquid Glass.** Three graduated glass levels, used only where a
  surface floats above content: navigation, the mobile dock, popovers, dialogs,
  command menu, and selected toolbars. Tables, forms, and dense data stay on
  opaque surfaces so numbers remain legible.
- **Understated luxury, not visual extravagance.** One accent hue, muted status
  colours, hairline borders, and low-opacity shadows. No neon, no glow, no
  decorative blobs, no rainbow KPI cards.
- **Editorial typography.** Fluid headings, tabular numerals for all counts, and
  a clear three-step hierarchy (eyebrow → section title → content).
- **Calm density.** Compact but breathable: 13px body, 12px metadata, 10–11px
  uppercase eyebrow labels with wide tracking.
- **Honest UI.** A control that is not implemented is labelled as such
  (`ModulePlaceholder`) instead of looking interactive. No dead buttons.
- **Accessibility first.** WCAG AA contrast for text in both themes, visible
  focus rings, keyboard support in every overlay, and `prefers-reduced-motion`
  support at the token level.

---

## 2. Colour System (OKLCH, single accent)

### 2.1 Canvas & surfaces (light)

| Token | Value | Purpose |
|---|---|---|
| `--background` | `oklch(0.979 0.003 265)` | Page canvas (`#F7F8FA`-equivalent) |
| `--foreground` | `oklch(0.19 0.014 265)` | Primary text (charcoal) |
| `--card` | `oklch(1 0 0)` | Opaque card surface |
| `--surface-container-low` | `oklch(0.968 0.004 265)` | Recessed sections, ghost toolbars |
| `--surface-container` | `oklch(0.951 0.006 265)` | Table headers, chips |
| `--surface-container-high` | `oklch(0.933 0.008 265)` | Hover/selected rows |
| `--muted-foreground` | `oklch(0.505 0.017 265)` | Secondary text (`#737985`-equivalent) |
| `--border` | `oklch(0.908 0.005 265)` | Hairline dividers and outlines |

Dark mode mirrors the same roles (`--background: oklch(0.145 0.010 265)`,
`--foreground: oklch(0.962 0.004 265)`, raised surfaces step up in lightness).

### 2.2 Accent

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--primary` | `oklch(0.47 0.165 266)` | `oklch(0.735 0.125 266)` | Refined institutional blue; AA on white, white text AA on it |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.16 0.02 266)` | Contrast pair |
| `--primary-container` | `oklch(0.945 0.032 266)` | — | Quiet accent fills (icons, active pill) |

### 2.3 Status (muted, never saturated)

| Status | Token | Container | Usage |
|---|---|---|---|
| Success | `--success` teal `oklch(0.50 0.105 175)` | `--success-container` | Present, active, approved, published |
| Warning | `--warning` amber `oklch(0.60 0.115 70)` | `--warning-container` | Excused, pending, review required |
| Error | `--error` / `--destructive` `oklch(0.53 0.17 25)` | `--error-container` | Absent, cancelled, suspended |
| Info | `--info` `oklch(0.50 0.115 245)` | `--info-container` | Scheduled, domain, informational |

**Rule:** status colour is always expressed through tokens
(`text-success`, `bg-warning-container/60`, `border-error/30`). Hardcoded
Tailwind palette classes (`text-emerald-600`, `bg-rose-500/10`, …) are not
permitted in `src/`; the module screens were migrated in this pass.

Charts use `--chart-1 … --chart-5` only.

---

## 3. Liquid Glass — three levels

| Level | Utility | Blur / saturate | Background | Used for |
|---|---|---|---|---|
| 1 — quiet | `glass-quiet`, `glass-card` | 10px / 130% | `--glass-1-bg` (68% white) | Dashboard flow cards, inline panels |
| 2 — panel | `glass-panel`, `glass-surface` | 22px / 155% | `--glass-2-bg` (78% white) | Sidebar inner surface, top bar, floating widgets, mobile dock |
| 3 — overlay | `glass-overlay` | 28px / 165% | `--glass-3-bg` (90% white) | Dialogs, dropdowns, command menu, notification popover |

Details:
- Every level has a hairline translucent border and a low-opacity shadow
  (`--elevation-1/2/3`).
- `glass-panel` adds one very soft top sheen (`--glass-sheen`) via `::before`
  with `isolation: isolate`; it is the only decoration the system allows.
- **Fallback:** `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`
  replaces all glass with `--card` + `--border`. Nothing becomes unreadable.
- Never stack more than two blurred layers, and never put glass behind long
  tables or forms.

React wrappers: `GlassPanel`, `GlassCard`, `GlassToolbar`, `GlassInset`
(`src/components/ui/glass.tsx`).

---

## 4. Typography

Primary family: **Geist / Inter** via `next/font` (`--font-sans`), mono:
**JetBrains Mono** (`--font-mono`).

| Utility | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `text-display` | `clamp(1.75rem, 1.32rem + 1.55vw, 2.5rem)` | 1.12 | −0.028em | 600 | Login hero, root showcase |
| `text-headline-lg` | `clamp(1.3rem, 1.16rem + 0.55vw, 1.6rem)` | 1.22 | −0.021em | 600 | Section/page titles |
| `text-headline-md` | `clamp(1rem, 0.96rem + 0.18vw, 1.125rem)` | 1.35 | −0.014em | 600 | Card and group titles |
| `text-headline-sm` | `0.9375rem` | 1.3 | −0.01em | 600 | Compact card titles |
| `text-body-lg` | `0.9375rem` | 1.55 | −0.004em | 400 | Intro paragraphs |
| `text-body-md` | `0.8125rem` | 1.5 | 0 | 400 | Default body |
| `text-body-sm` | `0.8125rem` | 1.45 | 0 | 400 | Secondary descriptions |
| `text-label-md` | `0.8125rem` | 1.35 | −0.004em | 500 | Labels, buttons |
| `text-label-sm` | `0.6875rem` | 1.2 | 0.04em | 500 | Badges, timestamps |
| `text-eyebrow` | `0.6875rem` | 1.2 | 0.085em | 600 | Uppercase eyebrow above titles |
| `text-code-sm` | `0.75rem` mono | 1.4 | 0 | 400 | Hashes, IDs, IST timestamps |

Compatibility aliases are defined so legacy call sites never render unstyled:
`text-title-sm`, `text-title-md`, `text-display-sm`, `text-body-xs`,
`text-label-xs`. All numbers use `tnum` (tabular numerals).

---

## 5. Layout, spacing, radii

- Office shell: `max-w-[86rem]`, fluid gutters
  (`px-4 sm:px-6 lg:px-8`), `min-h-dvh`, ambient canvas behind content.
- Spacing is a 4px grid: `space-xxs 2`, `xs 4`, `sm 8`, `md 12`, `lg 16`,
  `xl 24`, `2xl 32`; `gutter` 16, `margin` 24.
- Radii are restrained and capped at 18px:
  `xs 4`, `sm 6`, `md 8`, `lg 10`, `xl 12`, `2xl 16`, `3xl 18`, `full 9999`.
  Cards use `rounded-2xl`; inputs/buttons `rounded-lg`; chips `rounded-full`.
- Breakpoints: Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`).
  Sidebar is fixed from `lg`; below that, a floating glass dock (max 5 items)
  plus a drawer covers the remaining routes.

---

## 6. Motion

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 160ms | Hover, press, icon swap |
| `--duration-base` | 240ms | Tabs, popovers, colour changes |
| `--duration-slow` | 380ms | Page rise, sheet entrance |
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | Default easing |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--ease-in-out-soft` | `cubic-bezier(0.65, 0, 0.35, 1)` | Reversible transitions |

Utilities: `ease-brand`, `lift` (translateY −2px + shadow, hover-capable
pointers only), `press` (scale 0.99), `animate-rise`, `animate-fade`,
`page-flow` (route children settle in sequence, 55ms steps), `stagger-1/2/3`,
`skeleton-sheen`. Overlays enter in 150–200ms, entrances never exceed 380ms.

`motion/react` is used only where CSS cannot express the behaviour:
`layoutId` for the mobile dock active pill (spring), and `AnimatePresence`
for overlays. Every such component calls `useReducedMotion()`.

Global reduced-motion rule collapses all animation/transition durations to
0.01ms and disables ambient keyframes.

---

## 7. Component inventory (design-system level)

| Component | File | Role |
|---|---|---|
| `GlassPanel` / `GlassCard` / `GlassToolbar` / `GlassInset` | `ui/glass.tsx` | Glass surfaces at the three levels |
| `Card` | `ui/card.tsx` | Opaque default card: `rounded-2xl`, `border-border/70`, `bg-card/85`, `elevation-1` |
| `PageHeader` / `PageEyebrow` | `layout/page-header.tsx` | Eyebrow, title, description, actions slot, divider |
| `SectionHeader` | `shared/section-header.tsx` | Section title + description + trailing action |
| `MetricStrip` | `shared/metric-strip.tsx` | One surface, divided cells for KPI groups (replaces per-card colours) |
| `StatCard` | `shared/stat-card.tsx` | Editorial label/number/delta, optional progress and accent rule |
| `ModulePlaceholder` | `shared/module-placeholder.tsx` | Honest "not implemented yet" panel for meetings/hours/requests |
| `EmptyState` / `LoadingState` / `ErrorState` | `shared/*` | Calm, icon-led states with a real next action |
| `DataTable` | `shared/data-table.tsx` | TanStack table shell: toolbar, sticky header, row hover, pagination |
| `SyntheticDataNotice` | `shared/synthetic-data-notice.tsx` | Persistent "synthetic data only" trust signal |
| Sidebar / Topbar / MobileNav / CommandMenu / NotificationPopover | `layout/*` | Navigation shell (glass levels 2–3) |

Composition rules:
- A page starts with `PageHeader`, then `MetricStrip` (if it has counts), then
  content cards built from `Card`/`GlassCard`.
- KPI groups never use per-metric accent backgrounds; separation comes from
  dividers and typography.
- Tables sit on `Card`, not glass.

---

## 8. Focus, hover, and interaction states

- Focus: `outline: 2px solid var(--ring); outline-offset: 2px` via
  `focus-visible` utilities or the `focus-ring` utility. Never removed.
- Hover: surface shift (`bg-surface-container-low`) or `lift`; no colour jumps.
- Press: `press` (scale 0.99, 160ms).
- Disabled: 50% opacity + `cursor-not-allowed`; an adjacent sentence explains
  why when the reason is environmental (e.g. missing Supabase configuration).
- Active nav: glass pill with a 2px left indicator; the mobile dock animates
  the same pill between items with a shared `layoutId`.

---

## 9. Theme implementation

- `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`; `<html suppressHydrationWarning>`.
- Early inline script prevents theme flash; toggling uses
  `useSyncExternalStore` (no cascading renders).
- Both themes are designed, not inverted: dark uses lower-chroma accent and
  deeper glass backgrounds (`--glass-*-bg` are redefined in `.dark`).

---

## 10. Caching and perceived speed (UI contract)

- Route-level `loading.tsx` skeletons exist for the office shell and dashboard,
  so navigation paints structure immediately.
- Client router cache: `staleTimes.dynamic = 30s` (deliberate: every office
  route is access-gated) and `staleTimes.static = 300s`.
- Every office route's synthetic payload is server-cached with
  `use cache` + `cacheLife("hours")` and a `cacheTag` in
  `src/lib/mock-data/cached.ts` (dashboard, events, event detail by id,
  meetings, meeting detail by id, hours, attendance, projects, volunteers,
  team, audit, analytics). Authorization stays outside the cache and page
  helpers receive only plain ids/years, never session data.
- The command palette (`cmdk`) is a `ssr: false` dynamic chunk fetched on first
  use, so it is absent from the office shell's initial payload.
- The access gate is never cached: one indexed query per request, deduped
  inside the request with `React.cache`.
- Motion never delays input: entrances are ≤380ms and interruptible.
