import fs from "node:fs/promises";
import path from "node:path";

import { GRAPH_PATH_ENV_KEY, isEmbeddedMode } from "@/lib/runtimeMode";
import type { CacheGraph } from "@/types";

declare global {
  // eslint-disable-next-line no-var
  var __nextCacheInspectorGraph__: CacheGraph | null | undefined;
}

function getGlobalGraphStore(): CacheGraph | null {
  if (typeof globalThis.__nextCacheInspectorGraph__ === "undefined") {
    globalThis.__nextCacheInspectorGraph__ = null;
  }

  return globalThis.__nextCacheInspectorGraph__;
}

/**
 * Stores the currently loaded cache graph in shared server memory.
 */
export function setCurrentGraph(graph: CacheGraph | null): void {
  globalThis.__nextCacheInspectorGraph__ = graph;
}

/**
 * Reads the current cache graph from shared server memory.
 */
export function getCurrentGraph(): CacheGraph | null {
  return getGlobalGraphStore();
}

/**
 * Resolves the standalone graph file path.
 */
export function getStandaloneGraphFilePath(): string {
  return process.env[GRAPH_PATH_ENV_KEY] ?? path.join(process.cwd(), ".next", "cache-inspector", "cache-graph.json");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads a cache graph from the standalone graph file if available.
 */
export async function readStandaloneGraph(): Promise<CacheGraph | null> {
  const graphFilePath = getStandaloneGraphFilePath();

  if (!(await pathExists(graphFilePath))) {
    return null;
  }

  const fileContents = await fs.readFile(graphFilePath, "utf8");
  return JSON.parse(fileContents) as CacheGraph;
}

/**
 * Returns the best available graph source for the current runtime mode.
 */
export async function getAvailableGraph(): Promise<CacheGraph | null> {
  if (isEmbeddedMode()) {
    return getCurrentGraph();
  }

  const memoryGraph = getCurrentGraph();

  if (memoryGraph) {
    return memoryGraph;
  }

  const fileGraph = await readStandaloneGraph();

  if (fileGraph) {
    setCurrentGraph(fileGraph);
  }

  return fileGraph;
}
