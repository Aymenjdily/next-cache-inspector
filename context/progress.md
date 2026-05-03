# Build Progress

Check off items as they are completed. Update this file after every session so the next agent (or next run) knows exactly where to resume.

---

## Phase 1: Foundation

- [x] Initialize Next.js 15 + TypeScript project
- [x] Install dependencies (`ts-morph`, `zustand`, `@xyflow/react`, `next-themes`, `lucide-react`, `zod`, `chalk`, `commander`)
- [x] Initialize `shadcn/ui` with zinc base color
- [x] Create `src/types/inspector.ts` with all interfaces
- [x] Create full directory structure (`engine/`, `app/`, `cli/`, etc.)
- [x] Configure `tailwind.config.ts` with design system colors
- [x] Configure `next.config.ts` with standalone output

---

## Phase 2: Engine Core

- [x] `src/engine/parsers/routeParser.ts` - route discovery + segment config extraction
- [x] `src/engine/parsers/fetchParser.ts` - `fetch()` AST detection + `next` options
- [x] `src/engine/parsers/revalidateParser.ts` - `revalidateTag/Path/updateTag` detection
- [x] `src/engine/graphBuilder.ts` - assemble `CacheGraph`, deduplicate tags, cross-reference
- [x] `src/engine/rules/antiPatterns.ts` - implement all 5 anti-pattern rules
- [x] `src/engine/analyzer.ts` - orchestrator + error handling
- [x] Validate engine against fixture test app (< 3s scan time)

---

## Phase 3: Dashboard Shell

- [x] `src/app/_store/inspectorStore.ts` - Zustand store with all state + actions
- [x] `src/app/_components/InspectorShell.tsx` - sidebar + top bar + main layout
- [x] Sidebar navigation with 5 items + active state styling
- [x] `src/app/layout.tsx` with dark mode default (`next-themes`)
- [x] Stub all 5 view pages (`/topology`, `/tags`, `/fetches`, `/flow`, `/rules`)
- [x] Sidebar collapse/expand with localStorage persistence
- [x] Logo in sidebar brand header
- [x] Gold (`#FFC000`) primary color throughout

---

## Phase 4: Topology View

- [x] `src/app/_components/RouteNode.tsx` - React Flow custom node
- [x] `src/app/(views)/topology/page.tsx` - React Flow canvas + `dagre` layout
- [x] Detail sidebar (320px slide-out) with route config, fetches, tags, anti-patterns
- [x] VS Code link (`vscode://file/`) in detail sidebar
- [x] Node selection + highlight interaction
- [x] ScanScreen empty state when graph is null

---

## Phase 5: Remaining Views

### Tags View

- [x] `src/app/_components/TagCard.tsx`
- [x] Grid layout with search/filter
- [x] Expandable linked routes + revalidators
- [x] `revalidateTagAction` wired to "Revalidate Now" button
- [x] Toast feedback on revalidation

### Fetches View

- [x] Sortable table (source, URL, cache, revalidate, tags, warnings)
- [x] Filter by route type / cache strategy / warnings
- [x] Group by route
- [x] VS Code links

### Flow View

- [x] Directed graph (revalidators -> tags -> routes)
- [x] Animated invalidation edges
- [x] Blast radius highlight on revalidator click

### Rules View

- [x] Summary cards (warnings count, errors count)
- [x] Severity filter
- [x] Group by rule name
- [x] Click to navigate to source file/line

---

## Phase 6: API & CLI

- [x] `POST /api/scan` - on-demand engine scan
- [x] `GET /api/graph` - cached graph retrieval
- [x] `src/app/_actions/revalidate.ts` - `revalidateTagAction` + `revalidatePathAction`
- [x] Standalone mode guard (disable revalidation buttons)
- [x] `src/cli/index.ts` - CLI with `commander` + `zod` validation
- [x] CLI execution: scan -> write JSON -> start server (standalone) or print embed instructions
- [x] Exit codes implemented (0 success, 1 bad args, 2 engine crash)
- [x] CLI bundling with `tsup` (`dist/cli.mjs`)
- [x] `bin` entry in `package.json`
- [x] `prepublishOnly` build script

---

## Phase 7: Polish & Ship

- [x] `README.md` with install, usage, and CLI flags
- [x] `LICENSE` (MIT)
- [x] `.gitignore`
- [x] Fixture project in `/fixtures` for testing
- [x] No `console.log` statements (verified via grep)
- [x] `tsc --noEmit` passes
- [x] `npm run build` passes
- [x] CLI end-to-end test against fixture app passes
- [ ] GitHub Actions CI workflow (typecheck + lint)
- [ ] Initial changeset for release

---

## Current Status

**Last Updated:** 2026-05-02
**Current Phase:** Phase 7 (nearly complete)
**Blocked By:** None
**Next Action:** Publish to npm (`npm login` then `npm publish`)
