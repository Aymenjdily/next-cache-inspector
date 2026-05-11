import fs from "node:fs/promises";
import path from "node:path";

import { Project, ts } from "ts-morph";

import { EngineError } from "@/engine/errors";
import { buildGraph } from "@/engine/graphBuilder";
import * as logger from "@/engine/logger";
import { parseFetches } from "@/engine/parsers/fetchParser";
import { parseRevalidators } from "@/engine/parsers/revalidateParser";
import { parseRouteFile } from "@/engine/parsers/routeParser";
import type { ParsedRouteModule, RawScanResult } from "@/engine/types";
import type { CacheGraph } from "@/types";

const SCANNABLE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveAppDir(inputPath: string): Promise<string> {
  const absoluteInput = path.resolve(inputPath);
  const directAppDir = path.basename(absoluteInput) === "app" ? absoluteInput : path.join(absoluteInput, "app");

  if (await pathExists(directAppDir)) {
    return directAppDir;
  }

  throw new EngineError(
    "NO_APP_DIR",
    `No app/ directory found at ${absoluteInput}. This tool only supports Next.js App Router.`,
  );
}

async function walkDirectory(directoryPath: string): Promise<string[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(fullPath);
      }

      return SCANNABLE_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
    }),
  );

  return nestedPaths.flat();
}

async function hasRouteEntry(appDir: string): Promise<boolean> {
  const filePaths = await walkDirectory(appDir);
  return filePaths.some((filePath) => {
    const baseName = path.basename(filePath);
    return (
      baseName === "page.tsx" || baseName === "page.ts" || baseName === "page.jsx" || baseName === "page.js" ||
      baseName === "layout.tsx" || baseName === "layout.ts" || baseName === "layout.jsx" || baseName === "layout.js"
    );
  });
}

async function readVersion(): Promise<string> {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as { version?: string };
    return packageJson.version ?? "0.1.0";
  } catch {
    return "0.1.0";
  }
}

async function isPprEnabled(appDir: string): Promise<boolean> {
  const projectRoot = path.dirname(appDir);
  const configCandidates = ["next.config.ts", "next.config.js", "next.config.mjs", "next.config.cjs"];

  for (const configFile of configCandidates) {
    const configPath = path.join(projectRoot, configFile);

    if (!(await pathExists(configPath))) {
      continue;
    }

    const content = await fs.readFile(configPath, "utf8");

    if (/partialPrerendering\s*:\s*true/.test(content) || /\bppr\s*:\s*true/.test(content)) {
      return true;
    }
  }

  return false;
}

function createProject(): Project {
  return new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      allowJs: false,
      strict: true,
    },
  });
}

function createEmptyGraph(appDir: string, version: string): CacheGraph {
  return {
    routes: [],
    tags: [],
    revalidators: [],
    antiPatterns: [],
    meta: {
      appDir,
      scannedAt: new Date().toISOString(),
      version,
    },
  };
}

async function parseModules(
  appDir: string,
  filePaths: string[],
  version: string,
): Promise<RawScanResult> {
  const project = createProject();
  const modules: ParsedRouteModule[] = [];
  const revalidators = [];
  const scannedAt = new Date().toISOString();
  const pprEnabled = await isPprEnabled(appDir);

  for (const filePath of filePaths) {
    let sourceFile;

    try {
      sourceFile = project.addSourceFileAtPath(filePath);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unknown parse failure";
      logger.warn(`Failed to parse ${filePath}: ${message}`);
      continue;
    }

    const routeModule = parseRouteFile(sourceFile, { appDir, isPprEnabled: pprEnabled });
    const fetches = parseFetches(sourceFile);
    const fileRevalidators = parseRevalidators(sourceFile);

    if (routeModule) {
      routeModule.fetches = fetches;
      modules.push(routeModule);
    }

    revalidators.push(...fileRevalidators);
    sourceFile.forget();
  }

  return {
    appDir,
    version,
    scannedAt,
    modules,
    revalidators,
  };
}

/**
 * Analyzes a Next.js App Router project and returns its cache graph.
 */
export async function analyze(appDir: string): Promise<CacheGraph> {
  const resolvedAppDir = await resolveAppDir(appDir);
  const version = await readVersion();

  if (!(await hasRouteEntry(resolvedAppDir))) {
    return createEmptyGraph(resolvedAppDir.replace(/\\/g, "/"), version);
  }

  const filePaths = await walkDirectory(resolvedAppDir);
  const rawScan = await parseModules(resolvedAppDir, filePaths, version);
  const graph = buildGraph(rawScan);

  if (graph.routes.length === 0) {
    logger.info(`Scan completed with no route nodes in ${resolvedAppDir}.`);
  }

  return graph;
}
