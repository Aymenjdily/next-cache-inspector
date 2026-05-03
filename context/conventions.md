# Code Conventions

These rules are non-negotiable. They prevent drift, reduce review noise, and keep the agent consistent across all files.

---

## TypeScript

- **Strict mode enabled.** `tsconfig.json` must have `"strict": true`.
- **No `any`.** Use `unknown` with type guards if the type is truly unknown.
- **Explicit return types** on all exported functions and React components.
- **No implicit returns.** Every branch must return a value.
- **Interface over Type** for object shapes that cross module boundaries.
- **Type over Interface** for unions, tuples, and mapped types.

## File Naming

| Category         | Pattern                           | Example             |
| ---------------- | --------------------------------- | ------------------- |
| React Components | PascalCase                        | `RouteNode.tsx`     |
| Hooks            | camelCase, prefixed with `use`    | `useGraphLayout.ts` |
| Utilities        | camelCase                         | `graphBuilder.ts`   |
| Types            | PascalCase, in `types/` directory | `inspector.ts`      |
| Server Actions   | camelCase, in `_actions/`         | `revalidate.ts`     |
| API Routes       | `route.ts` inside named folder    | `api/scan/route.ts` |
| CSS Modules      | Not used. Tailwind only.          | —                   |

## Imports

- **Absolute imports via `@/` only.** No relative imports (`../../`) except within the same directory.
- **No barrel files** (`index.ts`) except for:
  - `src/types/` (exports all type interfaces)
  - `src/engine/` (exports `analyze` and `CacheGraph`)
- **Import order:**
  1. React / Next.js
  2. Third-party libraries
  3. Absolute `@/` imports
  4. Same-directory relative imports (if any)
- **Group with blank lines** between each import tier.

## React

- **Server Components by default.** Every new component is a Server Component unless it requires client interactivity.
- **`'use client'` required for:**
  - React Flow nodes and canvas wrappers
  - Zustand store consumers
  - Interactive elements with event handlers (`onClick`, `onChange`)
  - `useTransition`, `useState`, `useEffect`
- **No `useEffect` for data fetching.** Use Server Components or Server Actions.
- **Props destructuring** in function signature: `function RouteNode({ data }: { data: RouteNodeData })`.
- **No `React.FC`.** Use plain function components with typed props.

## Engine Code

- **No imports from `next/*`.** The engine is pure Node.js/TypeScript.
- **No imports from `react`.** The engine has no UI.
- **No `fs` synchronous methods.** Use `fs/promises` exclusively.
- **No `console.log`.** Use the internal `logger.ts` utility that writes to stderr with levels (`debug`, `info`, `warn`, `error`).
- **Graceful degradation.** If a file fails to parse, log the error and skip it. Never throw and crash the scan.

## Dashboard Code

- **No `fs` in Client Components.** File system access only in Server Components, API routes, or Server Actions.
- **No direct `fetch` to internal API.** Use Server Actions or server-side data loading instead of `fetch('/api/graph')` from a Server Component.
- **Zustand store access** only via custom hooks in `_store/`. No direct `useStore` calls in UI components.
- **Tailwind only.** No inline styles, no CSS modules, no styled-components.
- **Color tokens only.** Never hardcode hex values in components. Use Tailwind classes from `05-DESIGN-SYSTEM.md`.

## Error Handling

- **Engine:** Custom `EngineError` class with `.code` property (`NO_APP_DIR`, `EMPTY_SCAN`, `PARSE_ERROR`).
- **Dashboard API routes:** Return JSON with `{ error: string }` and appropriate HTTP status codes.
- **Server Actions:** Return `{ success: boolean, error?: string }` never throw raw errors to the client.
- **UI:** Toast notifications for async action feedback (success / error).

## Comments

- **JSDoc for public APIs.** Every exported function in `engine/` and `types/` must have a JSDoc comment.
- **Inline comments only for "why", not "what".** Code should be self-documenting; comments explain non-obvious decisions.
- **No commented-out code.** Delete it or move to `09-DEBUG-NOTES.md`.

## Testing (Post-MVP)

- Unit tests for engine parsers using fixture files.
- Component tests for React Flow nodes using `@testing-library/react`.
- E2E test for CLI scan → dashboard load flow.

**Note:** Testing infrastructure is not required for Phase 1–7. Document here but implement in Phase 8 if time permits.
