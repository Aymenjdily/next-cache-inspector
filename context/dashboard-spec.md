# Dashboard Specification

The Dashboard is a Next.js 15 App Router application that visualizes the `CacheGraph`. It is dark-mode-first, desktop-optimized, and uses React Flow for interactive graph rendering.

---

## Views (Sidebar Navigation)

The left sidebar (280px fixed width) contains navigation to five primary views. Each view is a separate page under the `(views)` route group.

| Route        | Path        | Purpose                                                                                      |
| ------------ | ----------- | -------------------------------------------------------------------------------------------- |
| **Topology** | `/topology` | React Flow tree of the `app/` directory showing route inheritance and fetch dependencies.    |
| **Tags**     | `/tags`     | Registry of all cache tags with relationship mapping and manual revalidation.                |
| **Fetches**  | `/fetches`  | Sortable/filterable table of every `fetch()` call found in the scan.                         |
| **Flow**     | `/flow`     | Directed graph showing how `revalidateTag` / `revalidatePath` calls flow to affected routes. |
| **Rules**    | `/rules`    | Aggregated anti-pattern report with severity filtering and file links.                       |

**Navigation UI:**

- Vertical list with icon + label.
- Active state: subtle background highlight (`bg-zinc-800`) + left border accent (`border-l-2 border-blue-500`).
- Collapsible on mobile (hamburger menu), but desktop is the primary target.

---

## React Flow Configuration

### Node Types

Register these custom node types with React Flow:

```ts
const nodeTypes = {
  routeNode: RouteNode,
  tagNode: TagNode,
  fetchNode: FetchNode,
  revalidatorNode: RevalidatorNode,
};
```

### Edge Types

```ts
const edgeTypes = {
  layoutWrap: LayoutWrapEdge, // dashed, gray
  fetchDependency: FetchEdge, // solid, colored by route type
  tagLink: TagLinkEdge, // dotted, amber
  invalidationFlow: InvalidationEdge, // animated, red/purple
};
```

### Layout Algorithms

- **Topology view:** Tree layout using `dagre` (top-down). Root at top, leaves at bottom.
- **Flow view:** Horizontal layout. Revalidators on left, routes on right, tags in middle.
- **Auto-fit:** Call `reactFlow.fitView({ padding: 0.2 })` after graph load.

### Node Sizing

- `routeNode`: `width: 240, height: 80`
- `tagNode`: `width: 160, height: 48`
- `fetchNode`: `width: 200, height: 64`
- `revalidatorNode`: `width: 180, height: 56`

---

## Component Inventory

### `InspectorShell` (`src/app/_components/InspectorShell.tsx`)

The root layout wrapper.

- Left sidebar (280px) with navigation.
- Top bar (64px) showing project name, scan timestamp, and refresh button.
- Main content area (flex-1) with padding `24px`.
- Background: `bg-zinc-950`. Surface cards: `bg-zinc-900 border border-zinc-800 rounded-lg`.

### `RouteNode` (`src/app/_components/RouteNode.tsx`)

React Flow custom node for routes.

- Shows route path (truncated if long).
- Badge showing `RouteType` with color coding.
- Bottom row: fetch count + tag count.
- Hover: slight scale (`transform: scale(1.02)`).
- Selected: ring highlight (`ring-2 ring-blue-500`).

### `TagCard` (`src/app/_components/TagCard.tsx`)

Used in Tags view and as React Flow node.

- Tag name in monospace.
- Pill badges: `Used by N routes`, `Invalidated by N actions`.
- Expandable section listing linked routes and revalidators.
- **Revalidate button:** Small button firing Server Action `revalidateTagAction(tag)`.
- Toast feedback on success/error.

### `FetchRow` (`src/app/_components/FetchRow.tsx`)

Table row for Fetches view.

- Columns: Source file (clickable, opens file path), URL, Cache, Revalidate, Tags, Warnings.
- Warning icon if fetch has anti-patterns.
- Code font for URL and tags.

### `AntiPatternAlert` (`src/app/_components/AntiPatternAlert.tsx`)

Banner/card for anti-patterns.

- Left border color by severity: `warning` = amber, `error` = red.
- Rule name as badge.
- Message + file path link.
- Collapsible group by rule type in Rules view.

### `RevalidateButton` (`src/app/_components/RevalidateButton.tsx`)

Reusable button for manual cache invalidation.

- States: idle → loading → success/error.
- Uses `useTransition` for Server Action state.
- Disabled if not in embedded mode (standalone mode cannot revalidate a foreign app).

---

## State Management (Zustand)

Store file: `src/app/_store/inspectorStore.ts`

```ts
interface InspectorState {
  graph: CacheGraph | null;
  isLoading: boolean;
  selectedRouteId: string | null;
  selectedTagName: string | null;
  selectedRevalidatorId: string | null;
  highlightMode: "none" | "tag" | "route" | "revalidator";
  antiPatternFilter: "all" | "warning" | "error";
  view: "topology" | "tags" | "fetches" | "flow" | "rules";

  setGraph: (graph: CacheGraph) => void;
  selectRoute: (id: string | null) => void;
  selectTag: (name: string | null) => void;
  selectRevalidator: (id: string | null) => void;
  setHighlightMode: (mode: InspectorState["highlightMode"]) => void;
  setAntiPatternFilter: (filter: InspectorState["antiPatternFilter"]) => void;
  setView: (view: InspectorState["view"]) => void;
}
```

**Rules:**

- `selectedRouteId` clears `selectedTagName` and `selectedRevalidatorId` when set.
- `highlightMode` affects React Flow edge and node opacity (unrelated items fade to 30%).

---

## Server Actions & API

### `revalidateTagAction(tag: string)` (`src/app/_actions/revalidate.ts`)

```ts
"use server";
import { revalidateTag } from "next/cache";

export async function revalidateTagAction(tag: string) {
  revalidateTag(tag);
  return { success: true };
}
```

### `revalidatePathAction(path: string)` (`src/app/_actions/revalidate.ts`)

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function revalidatePathAction(path: string) {
  revalidatePath(path);
  return { success: true };
}
```

**Constraints:**

- These only work in **embedded mode** where the dashboard runs inside the target Next.js app.
- In **standalone mode**, show the button as disabled with tooltip: "Revalidation requires embedded mode."

### `GET /api/graph` (`src/app/api/graph/route.ts`)

Returns the loaded `CacheGraph` as JSON. Used by the dashboard to hydrate state on page load.

---

## Interactions & UX

### Topology View

- Click route node → open detail sidebar (320px slide-out from right).
- Detail sidebar shows: full segment config, raw fetches list, linked tags, anti-patterns for this route.
- Ctrl/Cmd + click route node → scroll to file in editor (VS Code URL scheme: `vscode://file/${absPath}`).

### Tags View

- Search/filter tags by name.
- Click tag → highlight all linked routes in topology (cross-view sync via query param or store).
- Bulk revalidate: checkbox select + "Revalidate Selected" button.

### Fetches View

- Sort by: source file, revalidate value, tag count.
- Filter by: route type, cache strategy, has warnings.
- Group by route.

### Flow View

- Animated edges showing invalidation direction.
- Click revalidator node → highlight blast radius (all routes that will be affected).
- Useful for answering: "If I call `revalidateTag('posts')`, what gets purged?"

### Rules View

- Summary cards: total warnings, total errors.
- Filter by severity.
- Group by rule name.
- Click anti-pattern → navigate to source file/line.

---

## Responsive Behavior

**Primary target:** Desktop (1280px+).
**Minimum viable:** Tablet (1024px) — sidebar becomes collapsible overlay.
**Mobile:** Not supported. Show a placeholder: "next-cache-inspector is optimized for desktop use."

---

## Empty States

- **No scan yet:** "Run `npx next-cache-inspector --dir ./your-app` to begin."
- **Empty project:** "No routes found in app/. Is this a Next.js App Router project?"
- **No anti-patterns:** Green checkmark + "No cache issues detected. Great job!"
