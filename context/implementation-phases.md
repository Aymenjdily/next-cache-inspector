# Implementation Phases

Build the project in this exact order. Do not skip phases. Each phase has acceptance criteria that must pass before moving to the next.

---

## Phase 1: Foundation

**Goal:** Scaffold the project, install dependencies, and establish the type system.

### Tasks

- [ ] Initialize Next.js 15 project with TypeScript (`create-next-app`).
- [ ] Install dependencies: `ts-morph`, `zustand`, `@xyflow/react`, `next-themes`, `lucide-react`, `zod`, `chalk` (for CLI), `commander` (for CLI).
- [ ] Initialize `shadcn/ui` with zinc base color.
- [ ] Create `src/types/inspector.ts` with all interfaces from `02-DATA-SCHEMA.md`.
- [ ] Create empty directory structure:
  - `src/engine/`
  - `src/engine/parsers/`
  - `src/engine/rules/`
  - `src/app/_components/`
  - `src/app/_actions/`
  - `src/app/_store/`
  - `src/app/(views)/topology/`
  - `src/app/(views)/tags/`
  - `src/app/(views)/fetches/`
  - `src/app/(views)/flow/`
  - `src/app/(views)/rules/`
  - `src/app/api/scan/`
  - `src/app/api/graph/`
  - `src/cli/`
- [ ] Add `tailwind.config.ts` with custom colors matching `05-DESIGN-SYSTEM.md`.
- [ ] Add `next.config.ts` with standalone output support.

### Acceptance Criteria

- `npm run dev` starts without errors.
- `src/types/inspector.ts` exports all types and compiles with `tsc --noEmit`.
- Directory structure matches `01-ARCHITECTURE.md` exactly.

---

## Phase 2: Engine Core

**Goal:** Build the static analysis engine that produces a valid `CacheGraph`.

### Tasks

- [ ] Implement `src/engine/parsers/routeParser.ts`:
  - Discover all route files in `app/`.
  - Extract `dynamic`, `revalidate`, `fetchCache` exports.
  - Map file paths to URL paths (handle groups, dynamic params, catch-all).
  - Detect `generateStaticParams` presence.
- [ ] Implement `src/engine/parsers/fetchParser.ts`:
  - Find all `fetch()` calls via ts-morph AST.
  - Extract `next: { revalidate, tags, cache }`.
  - Handle string literal URLs and template literals.
- [ ] Implement `src/engine/parsers/revalidateParser.ts`:
  - Find `revalidateTag()`, `revalidatePath()`, `updateTag()` calls.
  - Extract target string literals.
  - Record source file and line number.
- [ ] Implement `src/engine/graphBuilder.ts`:
  - Assemble `RouteNode[]`, `CacheTag[]`, `Revalidator[]`.
  - Deduplicate tags.
  - Cross-reference tags to routes and revalidators.
  - Build layout inheritance chain for each route.
- [ ] Implement `src/engine/rules/antiPatterns.ts`:
  - All 5 rules from `03-ENGINE-SPEC.md`.
  - Return `AntiPattern[]` with correct severity and rule names.
- [ ] Implement `src/engine/analyzer.ts`:
  - Orchestrate parsers and graph builder.
  - Handle parse errors gracefully (skip file, log, continue).
  - Return complete `CacheGraph` with `meta`.

### Acceptance Criteria

- Running `analyze('./fixtures/test-app')` on a sample Next.js project returns a `CacheGraph` with:
  - Correct route count.
  - Correct route types (static, dynamic, ISR, PPR).
  - All fetches parsed with tags and revalidate values.
  - All revalidators discovered.
  - At least one anti-pattern detected if test app has intentional errors.
- Engine completes in < 3 seconds on test app with 20 routes.
- No `any` types in engine code.

---

## Phase 3: Dashboard Shell

**Goal:** Build the UI frame, navigation, and state management.

### Tasks

- [ ] Implement `src/app/_store/inspectorStore.ts` with Zustand.
  - All state fields and actions from `04-DASHBOARD-SPEC.md`.
  - Selection clearing rules (selecting route clears tag/revalidator).
- [ ] Implement `src/app/_components/InspectorShell.tsx`:
  - Left sidebar (280px) with 5 navigation items + icons.
  - Top bar with project name, scan timestamp, refresh button.
  - Main content area with `children`.
  - Dark mode default via `next-themes`.
- [ ] Implement sidebar navigation using Next.js `<Link>` with active state styling.
- [ ] Implement `src/app/layout.tsx` wrapping `InspectorShell`.
- [ ] Stub all 5 view pages with placeholder content and correct routes:
  - `/topology`
  - `/tags`
  - `/fetches`
  - `/flow`
  - `/rules`

### Acceptance Criteria

- Dashboard renders at `localhost:3000` with sidebar, top bar, and 5 navigation items.
- Clicking navigation items switches views without full page reload.
- Zustand store initializes with `null` graph and can be hydrated via `setGraph()`.
- Dark mode is active by default (no flash of light mode).

---

## Phase 4: Topology View

**Goal:** Render the route tree as an interactive React Flow graph.

### Tasks

- [ ] Implement `src/app/_components/RouteNode.tsx` (React Flow custom node).
  - Show route path, type badge, fetch count, tag count.
  - Color coding by route type.
- [ ] Implement topology page at `src/app/(views)/topology/page.tsx`.
  - Load `CacheGraph` from store.
  - Transform routes into React Flow nodes and edges (layout inheritance).
  - Use `dagre` for automatic tree layout.
  - Implement node selection → opens detail sidebar.
- [ ] Implement detail sidebar (320px slide-out from right).
  - Show full segment config, fetches list, linked tags, anti-patterns for selected route.
  - Include "Open in VS Code" link (`vscode://file/${absPath}`).

### Acceptance Criteria

- Sample `CacheGraph` renders as a connected tree.
- Route nodes are color-coded correctly.
- Clicking a route opens the detail sidebar with accurate data.
- React Flow canvas supports pan, zoom, and fit-view.

---

## Phase 5: Tags, Fetches, Flow, Rules Views

**Goal:** Build the remaining four dashboard views.

### Tags View

- [ ] Implement `src/app/_components/TagCard.tsx`.
- [ ] Grid layout of all tags with search/filter.
- [ ] Expandable section showing linked routes and revalidators.
- [ ] "Revalidate Now" button wired to `revalidateTagAction` Server Action.
- [ ] Toast feedback on revalidation success/error.

### Fetches View

- [ ] Sortable table: Source file, URL, Cache, Revalidate, Tags, Warnings.
- [ ] Filter by route type, cache strategy, has warnings.
- [ ] Group by route.
- [ ] Click source file → VS Code link.

### Flow View

- [ ] Directed graph: revalidators on left, tags in middle, routes on right.
- [ ] Animated edges showing invalidation direction.
- [ ] Click revalidator → highlight blast radius (all affected routes).

### Rules View

- [ ] Summary cards: total warnings, total errors.
- [ ] Filter by severity.
- [ ] Group by rule name.
- [ ] Click anti-pattern → navigate to source file/line.

### Acceptance Criteria

- All 4 views render correctly with sample data.
- Tags view can trigger revalidation (in embedded mode).
- Fetches view shows anti-pattern warning icons.
- Flow view animates edges on load.
- Rules view filters correctly by severity.

---

## Phase 6: API & CLI

**Goal:** Wire the Engine to the Dashboard and ship the CLI.

### Tasks

- [ ] Implement `src/app/api/scan/route.ts` (POST handler).
  - Accept `{ appDir }`, run `analyze()`, return `{ graph }`.
  - Error handling for missing directory or engine crash.
- [ ] Implement `src/app/api/graph/route.ts` (GET handler).
  - Return cached graph from memory or file system.
- [ ] Implement `src/app/_actions/revalidate.ts`:
  - `revalidateTagAction` and `revalidatePathAction`.
  - Guard against standalone mode (disable if not embedded).
- [ ] Implement `src/cli/index.ts`:
  - Parse flags with `commander` + `zod` validation.
  - Run `analyze()`.
  - Write `cache-graph.json`.
  - Start Next.js dev server in standalone mode, or print embed instructions.
- [ ] Add shebang and build script for CLI binary.

### Acceptance Criteria

- `npx next-cache-inspector --dir ./fixtures/test-app` starts dashboard on port 4242.
- Dashboard loads the generated graph automatically.
- Clicking "Rescan" in UI calls `POST /api/scan` and updates the graph.
- Revalidation buttons work in embedded mode and are disabled in standalone mode.
- CLI exits with code 0 on success, 1 on bad args, 2 on engine crash.

---

## Phase 7: Polish & Documentation

**Goal:** Make it shippable.

### Tasks

- [ ] Add `README.md` with installation, usage, and screenshots.
- [ ] Add `LICENSE` (MIT).
- [ ] Add `.github/workflows/ci.yml` (typecheck + lint + test on PR).
- [ ] Add at least one fixture project in `/fixtures` for manual testing.
- [ ] Ensure all components have explicit return types.
- [ ] Remove all `console.log` statements; use `logger.ts` utility.
- [ ] Verify no `any` types remain with `tsc --noEmit`.
- [ ] Add `changeset` for initial release.

### Acceptance Criteria

- Repository is publishable to npm.
- `npm run build` completes without errors.
- `npm run typecheck` passes.
- Fixture project can be scanned and visualized end-to-end.
