/**
 * Determined caching behavior of a route.
 */
export type RouteType = "static" | "dynamic" | "ISR" | "PPR";

/**
 * Supported values for the route segment `dynamic` export.
 */
export type DynamicExport = "auto" | "force-dynamic" | "error" | "force-static";

/**
 * Supported values for the route segment `fetchCache` export.
 */
export type FetchCacheExport =
  | "default-cache"
  | "default-no-store"
  | "only-no-store"
  | "force-no-store";

/**
 * The invalidation mode used by a revalidation call site.
 */
export type RevalidatorType = "tag" | "path";

/**
 * Visual severity for anti-pattern reporting.
 */
export type Severity = "warning" | "error";

/**
 * Represents a single `fetch()` invocation discovered in a route or layout file.
 */
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

/**
 * Represents a single route in the `app/` directory tree.
 */
export interface RouteNode {
  /** Unique identifier: relative file path from app/ root */
  id: string;
  /** The URL path this route handles */
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

/**
 * A deduplicated cache tag found across all fetch calls.
 */
export interface CacheTag {
  /** The tag string */
  name: string;
  /** RouteNode IDs that have fetches using this tag */
  usedBy: string[];
  /** Revalidator IDs that target this tag for invalidation */
  invalidatedBy: string[];
}

/**
 * A call site that invalidates cache.
 */
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

/**
 * A detected misconfiguration or suspicious caching pattern.
 */
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

/**
 * The top-level scan artifact exchanged between the engine and the dashboard.
 */
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
