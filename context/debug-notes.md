# Debug Notes

Living scratchpad. Update this file during and after every build session. It teaches the agent what worked, what failed, and what to watch out for.

---

## 2026-05-01 - Project Kickoff

- `ts-morph` `Project` must use `compilerOptions: { module: 1 }` (ESNext) to parse Next.js files with `import` syntax correctly.
- React Flow nodes need explicit `width` and `height` in the node data object, or `dagre` layout breaks silently.
- `next-themes` with `forcedTheme: 'dark'` prevents light-mode flash on initial load.
- Do NOT use `fs/promises` in Client Components - Next.js App Router will error at build time. Only use in Server Components, API routes, or the CLI layer.

## 2026-05-01 - Phase 1 Foundation

- Moving the app from root `app/` to `src/app/` requires deleting stale `.next/` artifacts before running `tsc --noEmit`, otherwise generated route validator types still point at the old file locations.
- PowerShell treats route-group paths like `(views)` specially unless they are quoted. Use quoted paths when creating `src/app/(views)/...` directories from the shell.
- A sandboxed `next dev` run can fail on Windows with `spawn EPERM`; rerunning outside the sandbox avoids a false-negative startup check.

## 2026-05-01 - Phase 2 Engine Core

- Route Handlers (`app/**/route.ts`) should not inherit `layout.tsx` wrappers in the graph. Treat them as standalone route nodes for layout resolution.
- Verifying the engine end-to-end without adding runtime tooling is easiest by compiling a temporary JS build with `tsc --outDir ... --noEmit false`, then running the analyzer on a fixture app.
- The fixture app can exercise `updateTag()` parsing with a local `declare function updateTag(...)` stub even if the installed Next version does not export that symbol yet.

## 2026-05-01 - Phase 3 Dashboard Shell

- `next-themes` works cleanly in App Router when `forcedTheme="dark"` is applied through a small client provider and the root `<html>` uses `suppressHydrationWarning`.
- The shell store `view` state should sync from `pathname` on mount, not only from navigation clicks, or direct loads like `/tags` will leave Zustand on the default `topology` view.

## 2026-05-01 - Phase 4 Topology View

- React Flow v12 generics are easiest to keep strict by passing the full custom node type to `useReactFlow` and `<ReactFlow<...>>`, while the custom node component itself uses `NodeProps<YourNodeType>`.
- `fitView({ padding: 0.2 })` belongs in a `useEffect` after nodes and edges are available; using it there matches both the spec and the React Flow timing gotcha from kickoff notes.
- `dagre` needs `@types/dagre` under strict TypeScript or the topology layout file will fail with an implicit `any` module error.

## 2026-05-01 - Phase 5 Remaining Views

- Placeholder tag revalidation is cleanest as a local async simulation plus transient in-app toasts, which keeps the UI complete without leaking Phase 6 Server Action wiring into the view layer.
- Flow view blast-radius highlighting is easiest when opacity is derived directly from the selected revalidator graph during node construction, instead of mutating React Flow internals after render.
- Fetch warning badges are most reliable when linked by `FetchCall.sourceFile` and line, with a small fallback for route-level ISR warnings that share the same source file.

## 2026-05-02 - Phase 6 API and CLI

- The dashboard hydrates cleanly from a server-side graph loader when `layout.tsx` reads the available graph and passes it through a tiny client `GraphHydrator`; this avoids inventing another store or forcing a first-render API fetch.
- Standalone mode works best with explicit environment variables: one for embedded detection and one absolute graph file path. That keeps `/api/graph`, `/api/scan`, the CLI, and the UI guard all aligned on the same source of truth.
- Revalidation buttons should stay visibly disabled in standalone mode and still preserve the server-side action guard, so accidental invocation never leaks an uncaught `next/cache` misuse into the client.

---

## Known Gotchas (Watch List)

### ts-morph

- Files with syntax errors (unclosed braces) will crash `project.addSourceFileAtPath()`. Wrap in `try/catch` and skip.
- `getVariableDeclaration()` returns `undefined` if the export is a `const` with a non-literal initializer (for example, `const revalidate = getRevalidate()`). Skip these - we only handle literals.

### React Flow

- `@xyflow/react` v12 changed the `Node` type generic. Use `Node<RouteNodeData>` not `Node<RouteNodeData, 'routeNode'>`.
- Custom edges must be registered in `edgeTypes` prop AND referenced by `type` in edge data.
- `fitView()` must be called inside `useEffect` after nodes are set, not during render.

### Next.js App Router

- Server Actions cannot be imported from Client Components into Server Components. Keep actions in `_actions/` and import directly where used.
- Route Handlers (`route.ts`) must export HTTP method handlers (`GET`, `POST`). Default export does not work.

### Tailwind / shadcn

- shadcn/ui defaults to the zinc scale only if `components.json` is configured explicitly. Keep `baseColor: "zinc"` and `cssVariables: true`.
- `text-[11px]` is not a default Tailwind class but works with JIT. Use it for badges only.

---

## TODO (Active)

- [ ] Add support for `generateStaticParams` detection in `routeParser.ts` - currently only checks for export existence, does not parse return values.
- [ ] Handle `fetchCache` export on layouts - child routes should conceptually inherit layout fetch cache settings (visual indicator only, not enforced).
- [ ] Support `unstable_cache` from Next.js 14+ as an alternative cache source to `fetch()`.
- [ ] Add file watcher mode (`chokidar`) for auto-rescan during development - Phase 5 stretch goal.
- [ ] Write fixture test app with intentional anti-patterns for CI validation.

---

## Decisions Log

| Date       | Decision                        | Rationale                                                                                         |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| 2026-05-01 | Use `dagre` for topology layout | Handles hierarchical trees out of the box; lighter than writing a custom D3 force layout.         |
| 2026-05-01 | No light mode                   | Developer tools are overwhelmingly used in dark mode; reduces design system complexity by 50%.    |
| 2026-05-01 | Standalone + Embedded dual mode | Standalone for quick debugging of any repo; embedded for live revalidation inside the target app. |
