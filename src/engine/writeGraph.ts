import fs from "node:fs/promises";
import path from "node:path";

import type { CacheGraph } from "@/types";

/**
 * Serializes a cache graph to a pretty-printed JSON file.
 */
export async function writeGraph(graph: CacheGraph, outputPath: string): Promise<void> {
  const outputDirectory = path.dirname(outputPath);

  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
}
