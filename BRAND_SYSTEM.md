# FastLane -- Brand System

**Version:** 1.0
**Last Updated:** 2026-02-25

---

## 1. Brand Values

| Value | Meaning |
|---|---|
| **Simplicity** | Fasting should feel effortless, not clinical. Every screen answers one question at a time. |
| **Motivation** | Streaks, badges, and visual progress turn discipline into a game worth playing. |
| **Trust** | Clean design, transparent pricing, and honest copy. No dark patterns, no guilt trips. |
| **Accessibility** | Works on any device, any screen size, any ability level. Semantic HTML, ARIA labels, keyboard navigation. |
| **Progress** | The product celebrates forward movement -- every completed fast is a win, no matter the duration. |

---

## 2. Brand Voice

### Tone Spectrum

| Dimension | FastLane Leans Toward |
|---|---|
| Formal <-> Casual | **Casual-professional.** Friendly but not goofy. |
| Serious <-> Playful | **Encouraging.** Upbeat without minimizing effort. |
| Technical <-> Approachable | **Approachable.** Explain concepts simply; save jargon for tooltips. |
| Authoritative <-> Humble | **Confident but warm.** "We've got you" rather than "We know best." |

### Writing Guidelines

- **Headlines:** Short, active, benefit-driven. "Your Fasting Journey, Simplified."
- **Body Copy:** Conversational. Second person ("you/your"). One idea per paragraph.
- **Buttons/CTAs:** Start with a verb. "Start Fasting Free", "Upgrade to Pro", "Complete Fast".
- **Error Messages:** Empathetic and actionable. "Something went wrong. Please try again later."
- **Empty States:** Encouraging. "Ready to fast? Choose a protocol and start your fasting session."
- **Numbers:** Use tabular figures for timers and stats. Always show units ("16h fasting / 8h eating").

---

## 3. Color Palette

### 3.1 Primary -- Emerald Green

The primary brand color represents health, growth, and progress. Used for CTAs, active states, progress rings, and success indicators.

| Token | Hex | Usage |
|---|---|---|
| `--fl-green-50` | `#ecfdf5` | Tinted backgrounds, selected state fills |
| `--fl-green-100` | `#d1fae5` | Light badges, hover backgrounds |
| `--fl-green-200` | `#a7f3d0` | Borders on active elements |
| `--fl-green-300` | `#6ee7b7` | Decorative accents |
| `--fl-green-400` | `#34d399` | Secondary emphasis |
| `--fl-green-500` | **`#10b981`** | **Primary brand color.** Buttons, links, timer ring, badges. |
| `--fl-green-600` | `#059669` | Hover state for primary buttons |
| `--fl-green-700` | `#047857` | Active/pressed state |
| `--fl-green-800` | `#065f46` | Dark text on green backgrounds |
| `--fl-green-900` | `#064e3b` | Darkest green (rare) |

### 3.2 Secondary -- Orange

Orange conveys energy, urgency, and premium features. Used for Pro badges, upgrade CTAs, and warning states.

| Token | Hex | Usage |
|---|---|---|
| `--fl-orange-50` | `#fff7ed` | Pro feature tinted backgrounds |
| `--fl-orange-100` | `#ffedd5` | Pro badge backgrounds (light mode) |
| `--fl-orange-200` | `#fed7aa` | Decorative accents |
| `--fl-orange-300` | `#fdba74` | Hover states for orange elements |
| `--fl-orange-400` | `#fb923c` | Secondary emphasis |
| `--fl-orange-500` | **`#f97316`** | **Secondary brand color.** Pro lock icons, upgrade CTAs, feature gating. |
| `--fl-orange-600` | `#ea580c` | Hover state for secondary actions |
| `--fl-orange-700` | `#c2410c` | Active/pressed state |
| `--fl-orange-800` | `#9a3412` | Dark text on orange backgrounds |
| `--fl-orange-900` | `#7c2d12` | Darkest orange (rare) |

### 3.3 Neutrals -- Gray

| Token | Hex | Usage |
|---|---|---|
| `--fl-gray-50` | `#f9fafb` | Secondary backgrounds (light mode) |
| `--fl-gray-100` | `#f3f4f6` | Tertiary backgrounds, input fills |
| `--fl-gray-200` | `#e5e7eb` | Borders, dividers (light mode) |
| `--fl-gray-300` | `#d1d5db` | Hover borders |
| `--fl-gray-400` | `#9ca3af` | Tertiary text, placeholder text |
| `--fl-gray-500` | `#6b7280` | Secondary text (light mode) |
| `--fl-gray-600` | `#4b5563` | Secondary text (light mode, higher contrast) |
| `--fl-gray-700` | `#374151` | Primary text (dark mode secondary) |
| `--fl-gray-800` | `#1f2937` | Borders (dark mode) |
| `--fl-gray-900` | `#111827` | Primary text (light mode) |
| `--fl-gray-950` | `#030712` | Background (dark mode) |

### 3.4 Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `--fl-primary` | `var(--fl-green-500)` / `#10b981` | Default interactive color |
| `--fl-primary-hover` | `var(--fl-green-600)` / `#059669` | Hover state for primary |
| `--fl-primary-light` | `var(--fl-green-50)` / `#ecfdf5` | Tinted background for primary |
| `--fl-secondary` | `var(--fl-orange-500)` / `#f97316` | Accent / Pro features |
| `--fl-secondary-hover` | `var(--fl-orange-600)` / `#ea580c` | Hover state for secondary |
| `--fl-danger` | `#ef4444` | Destructive actions, errors |
| `--fl-danger-hover` | `#dc2626` | Hover for danger |
| `--fl-warning` | `#f59e0b` | Warnings, caution states |
| `--fl-success` | `var(--fl-green-500)` | Success messages, completed states |
| `--fl-info` | `#3b82f6` | Informational callouts |

### 3.5 Dark Mode

Dark mode is activated automatically via `prefers-color-scheme: dark`. The following tokens are overridden:

| Token | Light | Dark |
|---|---|---|
| `--fl-bg` | `#ffffff` | `--fl-gray-950` (`#030712`) |
| `--fl-bg-secondary` | `--fl-gray-50` | `--fl-gray-900` |
| `--fl-bg-tertiary` | `--fl-gray-100` | `--fl-gray-800` |
| `--fl-bg-elevated` | `#ffffff` | `--fl-gray-900` |
| `--fl-text` | `--fl-gray-900` | `--fl-gray-50` |
| `--fl-text-secondary` | `--fl-gray-600` | `--fl-gray-400` |
| `--fl-text-tertiary` | `--fl-gray-400` | `--fl-gray-600` |
| `--fl-border` | `--fl-gray-200` | `--fl-gray-800` |
| `--fl-border-hover` | `--fl-gray-300` | `--fl-gray-700` |

---

## 4. Typography

### 4.1 Font Families

| Role | Font | CSS Variable | Fallback Stack |
|---|---|---|---|
| **Sans (body, headings, UI)** | Geist Sans | `--font-geist-sans` | `system-ui, -apple-system, sans-serif` |
| **Mono (timers, code, stats)** | Geist Mono | `--font-geist-mono` | `ui-monospace, 'Cascadia Code', monospace` |

Both fonts are loaded via `next/font/google` with the `latin` subset and applied as CSS variables on `<body>`.

### 4.2 Type Scale

| Token | Size | Line Height | Usage |
|---|---|---|---|
| `--fl-text-xs` | 0.75rem (12px) | 1rem | Badges, tertiary labels, fine print |
| `--fl-text-sm` | 0.875rem (14px) | 1.25rem | Secondary text, descriptions, helper text |
| `--fl-text-base` | 1rem (16px) | 1.5rem | Body text, form labels, card content |
| `--fl-text-lg` | 1.125rem (18px) | 1.75rem | Section subheadings, card titles |
| `--fl-text-xl` | 1.25rem (20px) | 1.75rem | Page subheadings |
| `--fl-text-2xl` | 1.5rem (24px) | 2rem | Page headings |
| `--fl-text-3xl` | 1.875rem (30px) | 2.25rem | Hero subheading |
| `--fl-text-4xl` | 2.25rem (36px) | 2.5rem | Hero heading (mobile) |
| `--fl-text-5xl` | 3rem (48px) | 1.15 | Timer digits, hero heading (tablet) |
| `--fl-text-6xl` | 3.75rem (60px) | 1.1 | Hero heading (desktop) |

### 4.3 Font Weights

| Weight | Value | Usage |
|---|---|---|
| Normal | 400 | Body text, descriptions |
| Medium | 500 | Labels, form elements, subtle emphasis |
| Semibold | 600 | Card headings, navigation items, badge text |
| Bold | 700 | Page headings, stat values, streak numbers |
| Extrabold | 800 | Hero heading, pricing numbers |

### 4.4 Special Text Treatments

- **Timer Digits:** `text-5xl font-bold tracking-tight tabular-nums` using Geist Sans. Tabular numerals prevent layout shift as numbers change.
- **Stat Values:** `text-2xl font-bold tabular-nums` for dashboard quick stats.
- **Tracking:** `-0.025em` for headings (via `tracking-tight`), default for body, `0.05em` (via `tracking-wider`) for uppercase labels.

---

## 5. Design Token Reference

All design tokens are defined in `/src/styles/tokens.css` and applied globally via `:root`. The token naming convention follows the `--fl-{category}-{variant}` pattern.

### 5.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--fl-space-1` | 0.25rem (4px) | Icon gaps, tight padding |
| `--fl-space-2` | 0.5rem (8px) | Inline spacing, compact padding |
| `--fl-space-3` | 0.75rem (12px) | Small card padding, list gaps |
| `--fl-space-4` | 1rem (16px) | Standard padding, form gaps |
| `--fl-space-5` | 1.25rem (20px) | Medium spacing |
| `--fl-space-6` | 1.5rem (24px) | Section padding, card padding (md) |
| `--fl-space-8` | 2rem (32px) | Large card padding (lg), section gaps |
| `--fl-space-10` | 2.5rem (40px) | Large spacing |
| `--fl-space-12` | 3rem (48px) | Section separators |
| `--fl-space-16` | 4rem (64px) | Page section padding |
| `--fl-space-20` | 5rem (80px) | Hero vertical padding |
| `--fl-space-24` | 6rem (96px) | Maximum vertical padding |

### 5.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--fl-radius-sm` | 0.375rem (6px) | Badges, small tags |
| `--fl-radius-md` | 0.5rem (8px) | Inputs, buttons, small cards |
| `--fl-radius-lg` | 0.75rem (12px) | Cards, dialog panels, protocol picker items |
| `--fl-radius-xl` | 1rem (16px) | Large cards, feature sections |
| `--fl-radius-2xl` | 1.5rem (24px) | Hero stat bar, pricing cards |
| `--fl-radius-full` | 9999px | Avatars, pill badges, toggle switches, timer ring |

### 5.3 Shadows

| Token | Value | Usage |
|---|---|---|
| `--fl-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle cards, inactive elements |
| `--fl-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` | Default cards, dropdowns |
| `--fl-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` | Elevated cards, modals, timer glow |
| `--fl-shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), ...` | Floating elements, hover-lift |

### 5.4 Transitions

| Token | Value | Usage |
|---|---|---|
| `--fl-transition-fast` | `150ms ease` | Toggle switches, hover color changes |
| `--fl-transition-base` | `200ms ease` | Button hovers, card state changes, default |
| `--fl-transition-slow` | `300ms ease` | Page transitions, onboarding step animations |

### 5.5 Z-Index

| Token | Value | Usage |
|---|---|---|
| `--fl-z-dropdown` | 50 | Select menus, protocol picker dropdowns |
| `--fl-z-sticky` | 100 | App header, bottom navigation |
| `--fl-z-modal` | 200 | Dialog overlays, check-in form |
| `--fl-z-toast` | 300 | Toast notifications (highest layer) |

---

## 6. Component Design Principles

### 6.1 Primitives (`/src/components/ui/`)

The UI primitive library provides 10 foundational components. Each follows these rules:

1. **Composable:** Accept `className` for extension via `tailwind-merge` (the `cn()` utility).
2. **Accessible:** Include appropriate ARIA attributes, roles, and keyboard handlers.
3. **Variant-driven:** Use a `variant` prop (e.g., `primary`, `outline`, `ghost`, `danger`) rather than ad-hoc style props.
4. **Size-aware:** Support `sm`, `md`, `lg` sizing via a `size` prop.
5. **Forwarded refs:** Where applicable, forward React refs for imperative access.

| Component | Variants | Sizes | Notes |
|---|---|---|---|
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger` | `sm`, `md`, `lg` | Supports `loading`, `leftIcon`, `rightIcon`, `fullWidth` |
| `Input` | Default, error | `sm`, `md`, `lg` | Supports `label`, `error`, `helperText` |
| `Card` | `default`, `elevated` | Padding: `sm`, `md`, `lg` | Semantic wrapper with rounded corners and border |
| `Dialog` | -- | -- | Animated overlay + panel; supports `title`, `description`, `onClose` |
| `Badge` | `default`, `success`, `warning`, `danger` | `sm`, `md` | Inline tag for labels, status indicators |
| `Progress` | Color: `primary`, `secondary`, `danger` | `trackHeight` | Horizontal bar with percentage fill |
| `Toast` | `success`, `error`, `info`, `warning` | -- | Auto-dismissing notification |
| `Skeleton` | -- | -- | Loading placeholder with pulse animation |
| `Slider` | -- | -- | Range input for hunger/energy levels |
| `Select` | -- | `sm`, `md`, `lg` | Dropdown selection |

### 6.2 Composite Components

Composite components compose primitives and handle business logic:

- **TimerRing:** SVG-based circular progress with animated stroke, center time display, protocol label, and overtime indicator.
- **TimerControls:** Contextual buttons (Start/Complete/Extend/Cancel) based on active session state.
- **ProtocolPicker:** Grid of protocol cards with difficulty badges, benefit tags, recommended indicator, and Pro lock icon.
- **StreakBadge:** Flame icon with streak count; scales in prominence with longer streaks.
- **CheckinForm:** Mood selector (5 emoji levels), hunger/energy sliders, notes textarea.
- **ProGate:** Blurred content overlay with lock icon and upgrade CTA for non-Pro users.
- **OnboardingWizard:** 5-step wizard with progress bar, animated transitions, and step validation.
- **PricingTable:** Side-by-side plan comparison with monthly/yearly toggle and feature checklist.

### 6.3 Layout Components

| Component | Purpose |
|---|---|
| `AppShell` | Authenticated layout wrapper; provides plan context via React context |
| `AppHeader` | Top navigation bar with user menu |
| `Sidebar` | Desktop-only side navigation |
| `BottomNav` | Mobile-only bottom tab navigation |
| `MarketingHeader` | Public-facing header with logo, nav links, and auth CTAs |
| `Footer` | Marketing page footer |

---

## 7. Iconography

### Library: Lucide React

FastLane uses [Lucide React](https://lucide.dev/) (`lucide-react` v0.575.0) as its sole icon library. Lucide provides consistent 24x24 SVG icons with 2px stroke width.

### Icon Sizing Convention

| Context | Size (px) | Tailwind Class | Notes |
|---|---|---|---|
| Inline with text | 16 | `h-4 w-4` | Navigation labels, button icons |
| Standard UI | 18-20 | `h-5 w-5` | Card icons, stat icons, feature list checks |
| Emphasis | 24 | `h-6 w-6` | Section feature icons, ProGate lock |
| Hero/Large | 28-32 | `h-7 w-7` / `h-8 w-8` | Onboarding wizard icons, hero stats |

### Commonly Used Icons

| Icon | Component Name | Usage |
|---|---|---|
| Timer/Clock | `Clock` | Protocol cards, fasting schedule |
| Zap | `Zap` | Ready-to-fast state, onboarding finish CTA |
| Trophy | `Trophy` | Streak milestones, stats |
| Star | `Star` | App rating, beginner experience level |
| Flame | `Flame` | Streak badge |
| Lock | `Lock` | Pro-gated features |
| Check | `Check` | Completed states, selected items, feature inclusion |
| X | `X` | Feature exclusion, close actions |
| ArrowRight | `ArrowRight` | CTA arrows, navigation |
| ChevronLeft/Right | `ChevronLeft`, `ChevronRight` | Wizard navigation |
| Bell / BellOff | `Bell`, `BellOff` | Notification toggle |
| Globe | `Globe` | Timezone display |
| Target | `Target` | Weight loss goal |
| Heart | `Heart` | Health goal |
| Leaf | `Leaf` | Longevity goal |
| Brain | `Brain` | Mental clarity goal |
| Sparkles | `Sparkles` | Autophagy goal |
| Users | `Users` | Community/user count stat |

### Icon Color Convention

- **Default:** `text-foreground-secondary` (gray-600 light / gray-400 dark)
- **Active/Selected:** `text-[var(--fl-primary)]` (emerald-500)
- **Pro/Locked:** `text-amber-500` or `text-orange-600`
- **Danger:** `text-[var(--fl-danger)]` (red)
- **On Primary Background:** `text-white`
