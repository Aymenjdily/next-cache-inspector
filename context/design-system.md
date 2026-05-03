# Design System

The dashboard is a developer tool, not a consumer app. The aesthetic is precise, dark, and information-dense. Every visual decision must reduce cognitive load while scanning cache topology.

---

## Color Palette (Dark Mode Default)

The dashboard ships dark-only. Light mode is explicitly out of scope.

| Token            | Hex       | Usage                                            |
| ---------------- | --------- | ------------------------------------------------ |
| `bg-base`        | `#09090b` | Page background (zinc-950)                       |
| `bg-surface`     | `#18181b` | Cards, panels, sidebar (zinc-900)                |
| `bg-elevated`    | `#27272a` | Hover states, dropdowns, active rows (zinc-800)  |
| `border-default` | `#27272a` | Dividers, card borders (zinc-800)                |
| `border-focus`   | `#3f3f46` | Focus rings, dragged nodes (zinc-700)            |
| `text-primary`   | `#fafafa` | Headings, route paths (zinc-50)                  |
| `text-secondary` | `#a1a1aa` | Labels, metadata, timestamps (zinc-400)          |
| `text-muted`     | `#71717a` | Disabled states, placeholders (zinc-500)         |
| `accent-emerald` | `#10b981` | Static routes, success toasts                    |
| `accent-blue`    | `#3b82f6` | Dynamic routes, primary buttons, selection rings |
| `accent-amber`   | `#f59e0b` | ISR routes, warnings                             |
| `accent-purple`  | `#a855f7` | PPR routes, revalidation flow edges              |
| `accent-red`     | `#ef4444` | Errors, destructive actions                      |

**Rules:**

- Never use pure white `#ffffff` for text. Always `text-primary` (`#fafafa`).
- Never use pure black `#000000` for backgrounds. Always `bg-base` (`#09090b`).
- Accent colors are for data meaning (route types), not branding. Do not use them for decorative gradients.

---

## Typography

| Role          | Font                         | Weight | Size                               | Line Height |
| ------------- | ---------------------------- | ------ | ---------------------------------- | ----------- |
| UI Body       | Geist Sans or Inter          | 400    | `14px` (`text-sm`)                 | `1.5`       |
| UI Heading    | Geist Sans or Inter          | 600    | `16px` (`text-base`)               | `1.4`       |
| Route Path    | Geist Mono or JetBrains Mono | 500    | `13px` (`text-xs` slightly bumped) | `1.4`       |
| Code / Config | Geist Mono or JetBrains Mono | 400    | `12px` (`text-xs`)                 | `1.6`       |
| Badge / Pill  | Geist Sans or Inter          | 500    | `11px` (`text-[11px]`)             | `1`         |

**Rules:**

- All file paths, fetch URLs, and tag names use monospace.
- Headings never exceed `text-lg` (`18px`). This is a dense tool UI.
- `font-mono` for React Flow node labels to align with developer expectations.

---

## Spacing Scale

| Token       | Value  | Usage                              |
| ----------- | ------ | ---------------------------------- |
| `space-xs`  | `4px`  | Icon padding, inline spacing       |
| `space-sm`  | `8px`  | Badge padding, compact rows        |
| `space-md`  | `12px` | Button padding, card internal gaps |
| `space-lg`  | `16px` | Card padding, form fields          |
| `space-xl`  | `24px` | Page padding, section gaps         |
| `space-2xl` | `32px` | Sidebar width gutters              |

**Layout Constants:**

- Sidebar width: `280px` (fixed, never responsive below 1024px).
- Top bar height: `56px`.
- Detail sidebar width: `320px` (slide-out overlay, right side).
- React Flow container: `100%` of main content area, no external padding.

---

## Component Primitives

### Card

```ts
// Surface + border + radius
className = "bg-zinc-900 border border-zinc-800 rounded-lg";
// Internal padding
className = "p-4"; // space-lg
```

### Button (Primary)

```ts
className =
  "bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors";
```

- Height target: `32px`.
- No shadows. Flat design only.

### Button (Secondary / Ghost)

```ts
className =
  "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium px-3 py-1.5 rounded-md transition-colors";
```

### Badge (Route Type)

```ts
// Static
className =
  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[11px] font-medium";

// Dynamic
className = "bg-blue-500/10 text-blue-400 border border-blue-500/20 ...";

// ISR
className = "bg-amber-500/10 text-amber-400 border border-amber-500/20 ...";

// PPR
className = "bg-purple-500/10 text-purple-400 border border-purple-500/20 ...";
```

- Badges are always `text-[11px]` with `font-medium`.
- Use `bg-{color}-500/10` for subtle fill, never solid fills on badges.

### Input / Search

```ts
className =
  "bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700";
```

---

## Animation & Motion

| Interaction            | Duration | Easing                                      |
| ---------------------- | -------- | ------------------------------------------- |
| Button hover           | `150ms`  | `ease-out`                                  |
| Card hover             | `150ms`  | `ease-out`                                  |
| Sidebar slide          | `200ms`  | `cubic-bezier(0.4, 0, 0.2, 1)`              |
| Toast enter/exit       | `200ms`  | `ease-in-out`                               |
| React Flow node select | `150ms`  | `ease-out`                                  |
| Edge highlight pulse   | `1.5s`   | `ease-in-out` (infinite, only on Flow view) |

**Rules:**

- No bounce effects. No spring physics. This is a tool, not a game.
- React Flow edges animate only in Flow view to indicate invalidation direction.
- Respect `prefers-reduced-motion`: disable all non-essential motion.

---

## Icons

- **Library:** `lucide-react` only.
- **Size:** `16px` (`w-4 h-4`) for inline UI, `20px` (`w-5 h-5`) for sidebar navigation.
- **Stroke width:** `1.5` (default).
- **Color:** Inherit from parent text color. Never apply icon-specific colors except for status indicators (warning triangle in amber).

**Required Icons:**

- Layout / Topology: `Network`
- Tags: `Tag`
- Fetches: `ArrowDownToLine`
- Flow: `GitBranch`
- Rules: `ShieldAlert`
- Revalidate: `RefreshCw`
- External link: `ExternalLink`
- Chevron / Expand: `ChevronRight`, `ChevronDown`
- Close: `X`
- Search: `Search`
- Filter: `Filter`
- Success: `CheckCircle2`
- Error: `XCircle`
- Warning: `AlertTriangle`

---

## Scrollbars

Custom scrollbar styling for WebKit:

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
```

Firefox: `scrollbar-width: thin; scrollbar-color: #27272a transparent;`

---

## Z-Index Scale

| Layer                            | Z-Index |
| -------------------------------- | ------- |
| Base content                     | `0`     |
| React Flow controls              | `5`     |
| Sticky headers                   | `10`    |
| Sidebar (left)                   | `20`    |
| Detail sidebar (right slide-out) | `30`    |
| Modals / Toasts                  | `40`    |
| Tooltips                         | `50`    |

---

## No-Go List

- **No gradients** on backgrounds, cards, or buttons. Solid colors only.
- **No drop shadows**. Use borders to create elevation.
- **No border-radius above `8px` (`rounded-lg`)**. No pills unless for badges.
- **No emojis** in the UI. Lucide icons only.
- **No loading spinners** that take > 200ms to appear. Use skeleton screens for initial graph load.
