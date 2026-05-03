# Architecture

## Overview

The project is split into two distinct layers that communicate through a single typed data contract (`CacheGraph`). The Engine runs in Node.js at scan time. The Dashboard is a Next.js app that visualizes the results.

```
┌─────────────────────────────────────────────────────────────┐
│                      Target Next.js App                      │
│                        (user's project)                     │
│                           app/                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ file system
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    ENGINE (Node.js/TS)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ routeParser │  │ fetchParser │  │ revalidateParser  │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────┬─────────┘  │
│         └─────────────────┼─────────────────────┘            │
│                           ▼                                │
│                    ┌─────────────┐                         │
│                    │ graphBuilder│                         │
│                    └──────┬──────┘                         │
│                           │ CacheGraph (JSON)               │
└───────────────────────────┼───────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD (Next.js App)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Topology   │  │    Tags     │  │      Fetches        │ │
│  │   View      │  │   View      │  │       View          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Flow     │  │    Rules    │  │   API / Actions     │ │
│  │   View      │  │   View      │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│              Zustand Store (client state)                  │
│              React Flow (interactive graphs)               │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Engine (`src/engine/`)

A pure Node.js module with zero Next.js runtime dependencies. It reads files, parses ASTs, and emits a JSON graph.

- **Entry:** `analyzer.ts` — orchestrates the scan, accepts a target directory path.
- **Parsers:** Three independent AST analyzers using `ts-morph`:
  - `routeParser.ts` — discovers route files, extracts segment configs.
  - `fetchParser.ts` — finds and parses `fetch()` calls.
  - `revalidateParser.ts` — locates `revalidateTag()`, `revalidatePath()`, `updateTag()`.
- **Assembler:** `graphBuilder.ts` — deduplicates tags, cross-references relationships, runs anti-pattern rules.
- **Rules:** `antiPatterns.ts` — lint-style rules that flag cache misconfigurations.

**Constraints:**

- Never writes to the target project.
- Never executes target project code.
- Must handle malformed or incomplete TypeScript gracefully (skip and log, don't crash).

## Layer 2: Dashboard (`src/app/`)

A standard Next.js 15 App Router application. It can run in two modes:

1. **Standalone CLI mode:** The engine runs first, outputs `cache-graph.json`, then `next dev` starts the dashboard server (default port 4242).
2. **Embedded mode:** The dashboard is mounted as a route inside the user's own Next.js app at `/_cache`. The engine runs on-demand via a Server Action or at build time.

**State Management:**

- Zustand store holds the loaded `CacheGraph` and UI selections (selected route, selected tag, highlight mode).
- Server Actions handle cache invalidation (`revalidateTag`, `revalidatePath`) by proxying to Next.js APIs.

## Data Contract

The only bridge between Engine and Dashboard is the `CacheGraph` interface (fully defined in `02-DATA-SCHEMA.md`). The engine outputs it. The dashboard consumes it. No other communication channel exists.

## Key Technical Decisions

| Decision                 | Rationale                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ts-morph over Babel**  | We need type information and reliable AST traversal for `fetch()` call detection. ts-morph is purpose-built for this.                             |
| **React Flow over D3**   | React Flow provides built-in pan/zoom, node selection, and layout algorithms with less boilerplate for this use case.                             |
| **Zustand over Context** | Dashboard state is complex (graph + selection + view mode) and Zustand avoids prop-drilling across React Flow and sidebar components.             |
| **Static analysis only** | Runtime instrumentation requires wrapping user code, which introduces fragility and security concerns. Static analysis is safe and deterministic. |
| **No database**          | The graph is ephemeral scan output. JSON in memory or written to `.next/cache-inspector/` is sufficient.                                          |

## File System Boundaries

- Engine code must not import from `next/*` or React.
- Dashboard code must not import from `ts-morph` or `fs` (except in Server Actions).
- Shared code lives only in `src/types/inspector.ts`.
