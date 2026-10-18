# NSS Central Management System — UI & Design System Specification

## 1. Principles & Design Aesthetic
- **Internal Office Aesthetic**: High-density, calm, authoritative, and uncluttered. Avoid consumer decorative gimmicks or oversized gradients.
- **Single Accent Colour**: Authority Indigo (`#3525cd` / `oklch(0.42 0.22 268)` light, `oklch(0.70 0.18 268)` dark) used deliberately for primary interactive actions and active navigation items.
- **Neutral Surface Hierarchy**: A layered background structure (`surface-container-lowest` for cards, `surface-container-low`, `surface-container`, `surface-container-high`) providing natural depth without heavy drop shadows.
- **Restrained Glassmorphism**: High-blur (8–12px), high-saturation (180%), high-opacity (82%) glass effects applied selectively to sticky headers, dialogs, and floating toolbars with hairline borders (`oklch(from var(--border) l c h / 70%)`).
- **Strict Accessibility**: All text combinations meet or exceed WCAG AA (4.5:1 for normal text) with primary actions achieving WCAG AAA (7.8:1+).
- **Reduced Motion**: All animations and transitions automatically collapse to 0.01ms when `@media (prefers-reduced-motion: reduce)` is signaled by the user's OS.

---

## 2. Color Palette & Tokens (OKLCH)

### 2.1 Surfaces & Canvas
| Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--background` | `oklch(0.985 0.003 260)` | `oklch(0.12 0.012 260)` | Root canvas background |
| `--foreground` | `oklch(0.18 0.015 260)` | `oklch(0.96 0.005 260)` | Primary text (13.8:1+ contrast) |
| `--surface-container-lowest` | `oklch(1 0 0)` | `oklch(0.10 0.012 260)` | Lowest layer, white cards in light mode |
| `--surface-container-low` | `oklch(0.965 0.005 260)` | `oklch(0.14 0.012 260)` | Recessed sections, secondary cards |
| `--surface-container` | `oklch(0.945 0.008 260)` | `oklch(0.18 0.012 260)` | Table grouping, chip containers |
| `--surface-container-high` | `oklch(0.925 0.010 260)` | `oklch(0.22 0.012 260)` | Hover backgrounds, elevated chips |
| `--surface-container-highest` | `oklch(0.90 0.012 260)` | `oklch(0.26 0.012 260)` | Active selections, badge backing |
| `--on-surface-variant` | `oklch(0.44 0.020 260)` | `oklch(0.70 0.015 260)` | Secondary labels and metadata (5:1+ contrast) |

### 2.2 Primary Accent Colour
| Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--primary` | `oklch(0.42 0.22 268)` | `oklch(0.70 0.18 268)` | Primary buttons, active indicators |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.12 0.04 268)` | High contrast text on primary |
| `--primary-container` | `oklch(0.94 0.04 268)` | `oklch(0.25 0.08 268)` | Accent chip / container background |
| `--on-primary-container` | `oklch(0.28 0.18 268)` | `oklch(0.90 0.08 268)` | Accent chip text |

### 2.3 Operational Status Colours
| Status | Light Token (`--{status}`) | Light Container | Dark Token (`--{status}`) | Dark Container | Usage |
|---|---|---|---|---|---|
| **Success** | `oklch(0.50 0.16 148)` | `oklch(0.95 0.04 148)` | `oklch(0.72 0.16 148)` | `oklch(0.22 0.06 148)` | Present, Active, Approved, Published |
| **Warning** | `oklch(0.58 0.16 65)` | `oklch(0.95 0.05 65)` | `oklch(0.78 0.15 65)` | `oklch(0.25 0.06 65)` | Excused, Draft, Review Required |
| **Error / Destructive** | `oklch(0.52 0.22 27)` | `oklch(0.95 0.04 27)` | `oklch(0.70 0.20 27)` | `oklch(0.24 0.07 27)` | Absent, Suspended, Cancelled, Audit Alert |
| **Info** | `oklch(0.48 0.15 240)` | `oklch(0.95 0.04 240)` | `oklch(0.72 0.14 240)` | `oklch(0.22 0.05 240)` | Scheduled, Domain, Informational Note |

---

## 3. Typography Scale (Inter & JetBrains Mono)
Optimized via `next/font` with zero layout shift and automatic self-hosting:

| Class | Font Size / Line Height | Tracking | Weight | Typical Usage |
|---|---|---|---|---|
| `text-display` | `2rem` (32px) / `2.5rem` (40px) | `-0.025em` | 600 | Key page headline / landing titles |
| `text-headline-lg` | `1.5rem` (24px) / `2rem` (32px) | `-0.02em` | 600 | Page titles (Volunteers, Events) |
| `text-headline-md` | `1.125rem` (18px) / `1.5rem` (24px) | `-0.015em` | 600 | Section headers, card groups |
| `text-headline-sm` | `0.9375rem` (15px) / `1.25rem` (20px) | `-0.01em` | 600 | Card titles, compact modal titles |
| `text-body-lg` | `0.9375rem` (15px) / `1.375rem` (22px) | `-0.005em` | 400 | Introductory paragraphs |
| `text-body-md` | `0.8125rem` (13px) / `1.125rem` (18px) | `0em` | 400 | Data table rows, general content |
| `text-body-sm` | `0.75rem` (12px) / `1rem` (16px) | `0em` | 400 | Helper text, secondary descriptions |
| `text-label-md` | `0.8125rem` (13px) / `1.125rem` (18px) | `-0.005em` | 500 | Form labels, button text, table headers |
| `text-label-sm` | `0.6875rem` (11px) / `0.875rem` (14px) | `0.02em` | 500 | Badges, tags, timestamps |
| `text-code-sm` | `0.75rem` (12px) / `1rem` (16px) | `0em` | 400 | Hashes, IDs, timestamps (JetBrains Mono) |

---

## 4. Spacing & Radii Scale

### 4.1 Spacing (4px Base Grid)
- `space-xxs`: `0.125rem` (2px)
- `space-xs`: `0.25rem` (4px)
- `space-sm`: `0.5rem` (8px)
- `space-md`: `0.75rem` (12px)
- `space-lg`: `1rem` (16px)
- `space-xl`: `1.5rem` (24px)
- `space-2xl`: `2rem` (32px)
- `gutter`: `1rem` (16px)
- `margin`: `1.5rem` (24px)
- `margin-mobile`: `1rem` (16px)

### 4.2 Radii
- `rounded-xs`: `0.25rem` (4px)
- `rounded-sm`: `0.375rem` (6px)
- `rounded-md`: `0.5rem` (8px)
- `rounded-lg`: `0.625rem` (10px)
- `rounded-xl`: `0.75rem` (12px)
- `rounded-2xl`: `1rem` (16px)
- `rounded-full`: `9999px`

---

## 5. Focus & Interaction States
- **Focus Rings**:
  - CSS rule: `outline: 2px solid var(--ring); outline-offset: 2px;`
  - Tailwind utility: `focus-ring` or `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  - High contrast on both dark and light surfaces. Never hidden or removed without equivalent high-visibility indicator.
- **Glassmorphism**:
  - `glass-surface`: `bg-[oklch(from_var(--background)_l_c_h_/_82%)] backdrop-blur-md border border-[oklch(from_var(--border)_l_c_h_/_70%)]`
  - `glass-card`: `bg-[oklch(from_var(--card)_l_c_h_/_82%)] backdrop-blur-sm border border-[oklch(from_var(--border)_l_c_h_/_60%)]`

---

## 6. Theme Implementation Strategy
- Implemented via `next-themes` with `attribute="class"`, `defaultTheme="system"`, and `enableSystem`.
- `<html>` includes `suppressHydrationWarning`.
- Zero theme flicker on initial paint via early injected script.
- Client theme toggling avoids hydration cascading renders via React 19 `useSyncExternalStore`.
