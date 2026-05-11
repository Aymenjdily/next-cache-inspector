#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn, exec } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

import chalk from "chalk";
import { Command } from "commander";
import { z } from "zod";

import { analyze, writeGraph } from "@/engine";
import { EngineError } from "@/engine/errors";
import { EMBEDDED_MODE_ENV_KEY, GRAPH_PATH_ENV_KEY, PUBLIC_EMBEDDED_MODE_ENV_KEY } from "@/lib/runtimeMode";

const cliSchema = z.object({
  dir: z.string().min(1),
  port: z.number().int().positive().default(4242),
  embed: z.boolean().default(false),
  output: z.string().min(1).default(".next/cache-inspector/"),
});

interface CliOptions {
  dir: string;
  port: number;
  embed: boolean;
  output: string;
}

function getInspectorRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  // When bundled to dist/cli.js, package root is one level up.
  // When running from src/cli/index.ts, package root is two levels up.
  const isCompiled = path.extname(currentFilePath) === ".js" || path.extname(currentFilePath) === ".mjs";
  return isCompiled
    ? path.resolve(currentDir, "..")
    : path.resolve(currentDir, "..", "..");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveTargetPaths(targetDirectory: string): Promise<{ projectRoot: string; appDir: string }> {
  const projectRoot = path.resolve(targetDirectory);
  const appDir = path.join(projectRoot, "app");

  if (!(await pathExists(appDir))) {
    throw new EngineError(
      "NO_APP_DIR",
      `No app/ directory found at ${projectRoot}. This tool only supports Next.js App Router.`,
    );
  }

  return { projectRoot, appDir };
}

function getOutputFilePath(projectRoot: string, outputDirectory: string): string {
  return path.resolve(projectRoot, outputDirectory, "cache-graph.json");
}

async function parseCliOptions(): Promise<CliOptions> {
  const command = new Command();

  command
    .name("next-cache-inspector")
    .option("-d, --dir <dir>", "Target Next.js project root", process.cwd())
    .option("-p, --port <port>", "Port for the standalone dashboard server", "4242")
    .option("-e, --embed", "Print embed instructions instead of starting a server", false)
    .option("-o, --output <output>", "Output directory for cache-graph.json", ".next/cache-inspector/");

  command.parse(process.argv);

  const parsed = command.opts<{
    dir: string;
    port: string;
    embed: boolean;
    output: string;
  }>();

  return cliSchema.parse({
    dir: parsed.dir,
    port: Number(parsed.port),
    embed: parsed.embed,
    output: parsed.output,
  });
}

function printEmbedInstructions(projectRoot: string, graphPath: string): void {
  process.stdout.write(`${chalk.cyan("Embed mode enabled")}\n`);
  process.stdout.write(`${chalk.white("Project root:")} ${projectRoot}\n`);
  process.stdout.write(`${chalk.white("Graph file:")} ${graphPath}\n`);
  process.stdout.write(
    `${chalk.yellow("Next steps:")}\n` +
      `1. Mount the dashboard route inside your target app at ${chalk.cyan("/_cache")}.\n` +
      `2. Set ${chalk.cyan(PUBLIC_EMBEDDED_MODE_ENV_KEY)}=${chalk.green("true")} in the target app environment.\n` +
      `3. Ensure scan requests post the target ${chalk.cyan("app/")} directory path to ${chalk.cyan("/api/scan")}.\n`,
  );
}

function getNextBinPath(): string {
  const require = createRequire(fileURLToPath(import.meta.url));
  return require.resolve("next/dist/bin/next");
}

/**
 * Files required for the Next.js dev server to start.
 */
const DASHBOARD_FILES = [
  "src",
  "public",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "components.json",
  "demo-graph.json",
  "next-env.d.ts",
];

/**
 * When next-cache-inspector is installed via npm (globally or locally),
 * the package lives inside node_modules. Next.js intentionally skips
 * transpilation and path-alias resolution for files inside node_modules
 * (see next-swc-loader's maybeExclude and JsConfigPathsPlugin).
 *
 * To work around this, we copy the dashboard source files to a temporary
 * directory outside node_modules and run `next dev` from there.
 */
async function prepareTempDashboardDir(inspectorRoot: string): Promise<string> {
  const suffix = randomBytes(8).toString("hex");
  const tempDir = path.join(tmpdir(), `next-cache-inspector-${suffix}`);

  await fs.mkdir(tempDir, { recursive: true });

  // Copy required files
  for (const file of DASHBOARD_FILES) {
    const srcPath = path.join(inspectorRoot, file);
    if (await pathExists(srcPath)) {
      const destPath = path.join(tempDir, file);
      const stat = await fs.stat(srcPath);
      if (stat.isDirectory()) {
        await fs.cp(srcPath, destPath, { recursive: true, force: true });
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  // Write a minimal package.json so Next.js can read the project name
  await fs.writeFile(
    path.join(tempDir, "package.json"),
    JSON.stringify({ name: "next-cache-inspector-dashboard", version: "0.1.2" }, null, 2),
  );

  // Create a junction (Windows) or symlink (Unix) to node_modules so
  // dependencies are shared and we don't have to copy them.
  const nodeModulesSrc = path.join(inspectorRoot, "node_modules");
  const nodeModulesDest = path.join(tempDir, "node_modules");
  if (await pathExists(nodeModulesSrc)) {
    const linkType = process.platform === "win32" ? "junction" : "dir";
    await fs.symlink(nodeModulesSrc, nodeModulesDest, linkType);
  }

  return tempDir;
}

async function cleanupTempDashboardDir(tempDir: string): Promise<void> {
  try {
    // On Windows, removing a junction requires special handling.
    // fs.rm with recursive should handle it.
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup; the OS will reclaim temp files eventually.
  }
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const command =
    platform === "darwin" ? `open "${url}"` :
    platform === "win32" ? `start "" "${url}"` :
    `xdg-open "${url}"`;

  exec(command, (err) => {
    if (err) {
      process.stderr.write(`Failed to open browser: ${err.message}\n`);
    }
  });
}

async function startStandaloneServer(port: number, graphPath: string): Promise<number> {
  const inspectorRoot = getInspectorRoot();
  const nextBin = getNextBinPath();
  const tempDir = await prepareTempDashboardDir(inspectorRoot);

  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port), "--no-open"], {
      cwd: tempDir,
      stdio: "inherit",
      env: {
        ...process.env,
        [GRAPH_PATH_ENV_KEY]: graphPath,
        [EMBEDDED_MODE_ENV_KEY]: "false",
        [PUBLIC_EMBEDDED_MODE_ENV_KEY]: "false",
      },
    });

    child.on("error", reject);
    child.on("exit", async (code) => {
      await cleanupTempDashboardDir(tempDir);
      resolve(code ?? 0);
    });

    // Open browser to topology after giving the server time to start
    setTimeout(() => {
      openBrowser(`http://localhost:${port}/topology`);
    }, 2000);
  });
}

async function run(): Promise<number> {
  try {
    const options = await parseCliOptions();
    const { projectRoot, appDir } = await resolveTargetPaths(options.dir);

    process.stdout.write(`${chalk.cyan("Scanning")} ${chalk.white(appDir)}\n`);

    const graph = await analyze(appDir);
    const graphPath = getOutputFilePath(projectRoot, options.output);

    await writeGraph(graph, graphPath);

    process.stdout.write(`${chalk.green("Graph written")} ${chalk.white(graphPath)}\n`);

    if (options.embed) {
      printEmbedInstructions(projectRoot, graphPath);
      return 0;
    }

    process.stdout.write(`${chalk.cyan("Starting dashboard")} ${chalk.white(`http://localhost:${options.port}`)}\n`);
    return startStandaloneServer(options.port, graphPath);
  } catch (error) {
    if (error instanceof z.ZodError) {
      process.stderr.write(`${chalk.red("Invalid arguments")}\n`);
      process.stderr.write(`${error.issues.map((issue) => `- ${issue.message}`).join("\n")}\n`);
      return 1;
    }

    if (error instanceof EngineError && error.code === "NO_APP_DIR") {
      process.stderr.write(`${chalk.red(error.message)}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : "Unknown engine failure";
    process.stderr.write(`${chalk.red("Engine failure")}: ${message}\n`);
    return 2;
  }
}

const exitCode = await run();
process.exit(exitCode);
