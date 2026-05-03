# Data Schema

This file defines the single source of truth for all data structures in `next-cache-inspector`. The Engine produces this shape. The Dashboard consumes it. Nothing crosses this boundary that is not explicitly typed here.

---

## Primitive Types

```ts
export type RouteType = "static" | "dynamic" | "ISR" | "PPR";

export type DynamicExport = "auto" | "force-dynamic" | "error" | "force-static";

export type FetchCacheExport =
  | "default-cache"
  | "default-no-store"
  | "only-no-store"
  | "force-no-store";

export type RevalidatorType = "tag" | "path";

export type Severity = "warning" | "error";
```

---

## Core Interfaces

### `FetchCall`

Represents a single `fetch()` invocation discovered in a route or layout file.

```ts
export interface FetchCall {
  /** Unique identifier: `${sourceFile}:${line}` */
  id: string;

  /** Absolute path to the file containing this fetch */
  sourceFile: string;

  /** Line number (1-based) where the fetch call begins */
  line: number;

  /** The URL string if passed as a string literal; undefined if dynamic */
  url?: string;

  /** Value of `cache` inside the `next` option */
  cache?: "force-cache" | "no-store";

  /** Value of `revalidate` inside the `next` option */
  revalidate?: number | false;

  /** Extracted tag strings from `next.tags` */
  tags: string[];
}
```

**Rules:**

- `id` must be deterministic for deduplication.
- `tags` is always an array (empty if no tags found).
- `revalidate: false` means explicit opt-out of revalidation.

---

### `RouteNode`

Represents a single route in the `app/` directory tree.

```ts
export interface RouteNode {
  /** Unique identifier: relative file path from app/ root, e.g. `blog/[slug]/page.tsx` */
  id: string;

  /** The URL path this route handles, e.g. `/blog/[slug]` */
  path: string;

  /** Determined caching behavior of this route */
  type: RouteType;

  /** Raw values of exported segment configuration constants */
  segmentConfig: {
    dynamic?: DynamicExport;
    revalidate?: number | false;
    fetchCache?: FetchCacheExport;
  };

  /** All fetch() calls found inside this route file */
  fetches: FetchCall[];

  /** IDs of layout.tsx files that wrap this route, ordered from root to leaf */
  layouts: string[];
}
```

**Route Type Resolution Logic (Engine responsibility):**

1. If `segmentConfig.dynamic === 'force-dynamic'` → `dynamic`
2. Else if route has dynamic params (`[slug]`) and no `generateStaticParams` export → `dynamic`
3. Else if `segmentConfig.revalidate !== undefined` (and not `false`) → `ISR`
4. Else if PPR is enabled in `next.config.js` and this route uses `Suspense` boundaries → `PPR`
5. Else → `static`

---

### `CacheTag`

A deduplicated cache tag found across all fetch calls.

```ts
export interface CacheTag {
  /** The tag string, e.g. `posts`, `user-123` */
  name: string;

  /** RouteNode IDs that have fetches using this tag */
  usedBy: string[];

  /** Revalidator IDs that target this tag for invalidation */
  invalidatedBy: string[];
}
```

**Rules:**

- `name` is the raw string literal.
- A tag with empty `usedBy` is considered "orphan" and must trigger anti-pattern rule `orphan-revalidate-tag`.

---

### `Revalidator`

A call site that invalidates cache.

```ts
export interface Revalidator {
  /** Unique identifier: `${sourceFile}:${line}` */
  id: string;

  /** Whether this revalidates by tag or by path */
  type: RevalidatorType;

  /** The tag name or path string being targeted */
  target: string;

  /** Absolute path to the file containing the revalidation call */
  sourceFile: string;

  /** Line number (1-based) */
  line: number;
}
```

**Scope:**

- Detected in Server Actions, Route Handlers (`route.ts`), and API routes.
- `updateTag()` from Next.js 16 is treated as `type: 'tag'`.

---

### `AntiPattern`

A detected misconfiguration or suspicious pattern.

```ts
export interface AntiPattern {
  /** Unique identifier: `${rule}:${sourceFile}:${line}` */
  id: string;

  /** Visual severity in the dashboard */
  severity: Severity;

  /** Human-readable explanation */
  message: string;

  /** File where the issue was found */
  sourceFile: string;

  /** Line number (1-based) */
  line: number;

  /** Machine-readable rule name for filtering and documentation links */
  rule: string;
}
```

**Rule Names (must match engine exactly):**

- `no-store-with-revalidate`
- `isr-untagged-fetch`
- `orphan-revalidate-tag`
- `force-dynamic-with-revalidate`
- `layout-fetch-conflict`

---

## Root Graph

### `CacheGraph`

The top-level object emitted by the Engine and loaded into the Dashboard.

```ts
export interface CacheGraph {
  /** All discovered routes */
  routes: RouteNode[];

  /** All deduplicated cache tags */
  tags: CacheTag[];

  /** All revalidation call sites */
  revalidators: Revalidator[];

  /** All detected anti-patterns */
  antiPatterns: AntiPattern[];

  /** Metadata about the scan */
  meta: {
    /** Absolute path to the scanned app/ directory */
    appDir: string;

    /** ISO timestamp when the scan completed */
    scannedAt: string;

    /** next-cache-inspector version that produced this graph */
    version: string;
  };
}
```

---

## Example Instance

```json
{
  "routes": [
    {
      "id": "blog/[slug]/page.tsx",
      "path": "/blog/[slug]",
      "type": "ISR",
      "segmentConfig": { "revalidate": 3600 },
      "fetches": [
        {
          "id": "/app/blog/[slug]/page.tsx:12",
          "sourceFile": "/app/blog/[slug]/page.tsx",
          "line": 12,
          "url": "https://api.example.com/posts",
          "cache": "force-cache",
          "revalidate": 3600,
          "tags": ["posts"]
        }
      ],
      "layouts": ["layout.tsx", "blog/layout.tsx"]
    }
  ],
  "tags": [
    {
      "name": "posts",
      "usedBy": ["blog/[slug]/page.tsx"],
      "invalidatedBy": ["revalidate-1"]
    }
  ],
  "revalidators": [
    {
      "id": "revalidate-1",
      "type": "tag",
      "target": "posts",
      "sourceFile": "/app/api/revalidate/route.ts",
      "line": 8
    }
  ],
  "antiPatterns": [],
  "meta": {
    "appDir": "/Users/dev/my-app/app",
    "scannedAt": "2026-05-01T20:00:00.000Z",
    "version": "0.1.0"
  }
}
```

---

## Serialization Contract

- The Engine outputs **pretty-printed JSON** for human debugging.
- The Dashboard accepts the graph via:
  1. Direct file read (`cache-graph.json` in standalone mode).
  2. POST response from `/api/scan` (embedded mode).
- All IDs must be URL-safe strings (no spaces, use `-` or `:` delimiters).
