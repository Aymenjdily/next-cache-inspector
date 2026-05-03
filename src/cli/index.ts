#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

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

async function startStandaloneServer(port: number, graphPath: string): Promise<number> {
  const inspectorRoot = getInspectorRoot();
  const nextBin = getNextBinPath();

  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
      cwd: inspectorRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        [GRAPH_PATH_ENV_KEY]: graphPath,
        [EMBEDDED_MODE_ENV_KEY]: "false",
        [PUBLIC_EMBEDDED_MODE_ENV_KEY]: "false",
      },
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      resolve(code ?? 0);
    });
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
