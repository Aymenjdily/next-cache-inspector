# API Contracts

This file defines every public surface between the Engine, Dashboard, CLI, and the target Next.js app. No function, route, or flag exists that is not documented here.

---

## Server Actions

All Server Actions live in `src/app/_actions/revalidate.ts`.

### `revalidateTagAction(tag: string): Promise<{ success: boolean }>`

Invalidates a cache tag by proxying to Next.js native API.

```ts
"use server";
import { revalidateTag } from "next/cache";

export async function revalidateTagAction(tag: string) {
  revalidateTag(tag);
  return { success: true };
}
```

**Constraints:**

- Only callable from the Dashboard UI.
- Only functional in **embedded mode** (dashboard mounted inside target app).
- In standalone mode, the button calling this action must be disabled with tooltip: "Revalidation requires embedded mode."

### `revalidatePathAction(path: string): Promise<{ success: boolean }>`

Invalidates a full route path.

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function revalidatePathAction(path: string) {
  revalidatePath(path);
  return { success: true };
}
```

**Constraints:**

- Same as `revalidateTagAction`.

---

## Route Handlers

### `POST /api/scan` (`src/app/api/scan/route.ts`)

Triggers a fresh engine scan on demand. Used in embedded mode when the user clicks "Rescan" in the UI.

**Request Body:**

```ts
{
  appDir: string; // Absolute path to target app/ directory
}
```

**Response:**

```ts
{
  graph: CacheGraph;
}
```

**Errors:**

- `400` — `appDir` missing or not a valid directory.
- `500` — Engine crash (returns `{ error: string }`).

**Performance:** Must stream nothing; return full JSON after scan completes. Target < 3s.

### `GET /api/graph` (`src/app/api/graph/route.ts`)

Returns the currently loaded `CacheGraph`. Used by Dashboard to hydrate on page load or refresh.

**Response:**

```ts
CacheGraph | { error: "No scan data available. Run a scan first." };
```

**Status Codes:**

- `200` — Graph loaded successfully.
- `404` — No graph in memory (standalone mode without prior scan).

---

## CLI Interface

Entry point: `src/cli/index.ts`. Compiled binary: `next-cache-inspector`.

### Flags

| Flag       | Short | Type      | Default                  | Required | Description                                                                                               |
| ---------- | ----- | --------- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `--dir`    | `-d`  | `string`  | `process.cwd()`          | No       | Absolute or relative path to target Next.js project root. The CLI looks for `app/` inside this directory. |
| `--port`   | `-p`  | `number`  | `4242`                   | No       | Port for the standalone dashboard server.                                                                 |
| `--embed`  | `-e`  | `boolean` | `false`                  | No       | If true, outputs dashboard files to be mounted at `/_cache` instead of starting a dev server.             |
| `--output` | `-o`  | `string`  | `.next/cache-inspector/` | No       | Directory to write `cache-graph.json` after scan (relative to target project).                            |

### Command Examples

```bash
# Standalone — scan and start dashboard server
npx next-cache-inspector --dir ./my-app --port 4242

# Embedded — scan and output graph for mounting in target app
npx next-cache-inspector --dir ./my-app --embed

# CI / headless — scan only, write JSON, exit
npx next-cache-inspector --dir ./my-app --output ./reports/
```

### Execution Flow

1. Parse CLI flags.
2. Resolve `--dir` to absolute path.
3. Verify `app/` subdirectory exists.
4. Run `analyze(appDir)` from Engine.
5. Write `cache-graph.json` to `--output` path.
6. If `--embed`: copy dashboard build artifacts to target project's `app/_cache/` (or print instructions).
7. If standalone: start Next.js dev server on `--port` with dashboard pointing to the generated graph.

### Exit Codes

| Code | Meaning                                                           |
| ---- | ----------------------------------------------------------------- |
| `0`  | Success (scan complete, server started, or embed output written). |
| `1`  | Invalid arguments or missing `app/` directory.                    |
| `2`  | Engine scan failure (parse crash, out of memory).                 |

---

## Engine API (Internal)

These are not REST endpoints but the programmatic interface the CLI and Dashboard use.

### `analyze(appDir: string): Promise<CacheGraph>`

The single public function exported from `src/engine/analyzer.ts`.

**Input:** Absolute path to a directory containing `app/`.

**Output:** Fully assembled `CacheGraph`.

**Throws:**

- `EngineError` (custom error class) with `.code` property:
  - `NO_APP_DIR`: `app/` not found.
  - `EMPTY_SCAN`: No routes discovered.
  - `PARSE_ERROR`: One or more files failed to parse (non-fatal; partial graph returned if possible).

### `writeGraph(graph: CacheGraph, outputPath: string): Promise<void>`

Utility to serialize graph to pretty-printed JSON.

---

## Dashboard ↔ Engine Data Flow

### Standalone Mode

```
CLI runs analyze() → writes cache-graph.json → starts Next.js dashboard
Dashboard reads JSON via fs on server side → hydrates Zustand store
```

### Embedded Mode

```
User mounts dashboard at /_cache in their app
User clicks "Rescan" → POST /api/scan → Server runs analyze() → returns JSON
Dashboard hydrates from response
```

### File Watch Mode (Future / Optional)

```
Engine watches app/ via chokidar
On file change: re-runs analyze() → writes cache-graph.json
Dashboard polls GET /api/graph every 2s or uses SSE
```

**Note:** File watch mode is not required for MVP. Document here but do not implement until Phase 5.

---

## Type Safety Contract

- Every API route must use `NextRequest` / `NextResponse` with explicit typing.
- Server Actions must declare return types (no implicit `Promise<any>`).
- CLI flag parsing must use `zod` schema validation.
- Engine errors must be instances of `EngineError`, not raw `Error`.

---

## Security Boundaries

- The Engine only reads files. No eval, no require, no child process spawn.
- `POST /api/scan` accepts an arbitrary `appDir` path. In embedded mode, restrict to project root or require an allowlist environment variable.
- Server Actions (`revalidateTag`, `revalidatePath`) are only dangerous in the context of the app they run inside. In standalone mode, disable them entirely.
