#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn, exec } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { watch } from "node:fs";

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
  watch: z.boolean().default(false),
  export: z.string().optional(),
});

interface CliOptions {
  dir: string;
  port: number;
  embed: boolean;
  output: string;
  clean?: boolean;
  watch?: boolean;
  export?: string;
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
    .option("-o, --output <output>", "Output directory for cache-graph.json", ".next/cache-inspector/")
    .option("--clean", "Remove temp directories and cache files created by the inspector", false)
    .option("-w, --watch", "Watch for file changes and auto-rescan", false)
    .option("--export <format>", "Export report (html, json)", "");

  command.parse(process.argv);

  const parsed = command.opts<{
    dir: string;
    port: string;
    embed: boolean;
    output: string;
    clean: boolean;
    watch: boolean;
    export: string;
  }>();

  if (parsed.clean) {
    return { dir: parsed.dir, port: 0, embed: false, output: parsed.output, clean: true } as CliOptions;
  }

  if (parsed.export) {
    return { 
      dir: parsed.dir, 
      port: 0, 
      embed: false, 
      output: parsed.output, 
      export: parsed.export 
    } as CliOptions;
  }

  return cliSchema.parse({
    dir: parsed.dir,
    port: Number(parsed.port),
    embed: parsed.embed,
    output: parsed.output,
    watch: parsed.watch,
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
  // Resolve Next.js from the user's project (cwd) instead of from the package
  const require = createRequire(path.join(process.cwd(), "package.json"));
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
async function prepareTempDashboardDir(inspectorRoot: string, projectRoot: string): Promise<string> {
  const suffix = randomBytes(8).toString("hex");
  // Create temp dir as a sibling to the user's project so it's outside the
  // project tree (avoids Next.js picking up user's middleware/config files)
  // but on the same drive so symlinks work with Turbopack.
  const projectParent = path.dirname(projectRoot);
  const tempDir = path.join(projectParent, `.next-cache-inspector-${suffix}`);

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

  // Copy node_modules from the user's project instead of symlinking.
  // Turbopack doesn't support symlinks to node_modules that point outside
  // the project root, so we copy the entire node_modules directory.
  const userNodeModules = path.join(projectRoot, "node_modules");
  const nodeModulesDest = path.join(tempDir, "node_modules");
  if (await pathExists(userNodeModules)) {
    process.stdout.write(`${chalk.cyan("Copying dependencies")} (this may take a moment)...\n`);
    await fs.cp(userNodeModules, nodeModulesDest, { recursive: true, force: true });
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

async function startStandaloneServer(port: number, graphPath: string, projectRoot: string): Promise<number> {
  const inspectorRoot = getInspectorRoot();
  const nextBin = getNextBinPath();
  const tempDir = await prepareTempDashboardDir(inspectorRoot, projectRoot);

  return new Promise<number>((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
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

async function cleanInspectorFiles(projectRoot: string): Promise<void> {
  const parentDir = path.dirname(projectRoot);
  
  // Find and remove temp dashboard directories
  try {
    const entries = await fs.readdir(parentDir);
    const tempDirs = entries.filter(entry => entry.startsWith(".next-cache-inspector-"));
    
    for (const dir of tempDirs) {
      const fullPath = path.join(parentDir, dir);
      await fs.rm(fullPath, { recursive: true, force: true });
      process.stdout.write(`${chalk.green("Removed")} ${chalk.white(fullPath)}\n`);
    }
    
    if (tempDirs.length === 0) {
      process.stdout.write(`${chalk.gray("No temp directories found")}\n`);
    }
  } catch {
    // Directory might not exist or be accessible
  }
  
  // Remove cache-inspector directory from .next
  try {
    const cacheDir = path.join(projectRoot, ".next", "cache-inspector");
    if (await pathExists(cacheDir)) {
      await fs.rm(cacheDir, { recursive: true, force: true });
      process.stdout.write(`${chalk.green("Removed")} ${chalk.white(cacheDir)}\n`);
    }
  } catch {
    // Directory might not exist
  }
  
  // Remove cache-graph.json if it exists in the output location
  try {
    const outputPath = path.join(projectRoot, ".next", "cache-inspector", "cache-graph.json");
    if (await pathExists(outputPath)) {
      await fs.unlink(outputPath);
      process.stdout.write(`${chalk.green("Removed")} ${chalk.white(outputPath)}\n`);
    }
  } catch {
    // File might not exist
  }
}

async function generateReport(graph: Awaited<ReturnType<typeof analyze>>, format: string, projectRoot: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  
  if (format === "json") {
    const reportPath = path.join(projectRoot, `cache-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(graph, null, 2));
    process.stdout.write(`${chalk.green("Report exported")} ${chalk.white(reportPath)}\n`);
    return;
  }
  
  if (format === "html") {
    const reportPath = path.join(projectRoot, `cache-report-${timestamp}.html`);
    const html = generateHtmlReport(graph);
    await fs.writeFile(reportPath, html);
    process.stdout.write(`${chalk.green("Report exported")} ${chalk.white(reportPath)}\n`);
    return;
  }
  
  process.stderr.write(`${chalk.red("Unknown export format")}: ${format}. Use "html" or "json".\n`);
}

function generateHtmlReport(graph: Awaited<ReturnType<typeof analyze>>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cache Report - ${graph.meta.appDir}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #FFC000; margin-bottom: 0.5rem; }
    .meta { color: #666; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #111; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; }
    .card h3 { color: #999; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .card .value { font-size: 2rem; font-weight: bold; color: #FFC000; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #333; }
    th { color: #999; font-weight: 500; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .static { background: #10b98120; color: #10b981; }
    .dynamic { background: #3b82f620; color: #3b82f6; }
    .ISR { background: #f59e0b20; color: #f59e0b; }
    .PPR { background: #a855f720; color: #a855f7; }
    .warning { background: #f59e0b20; color: #f59e0b; }
    .error { background: #ef444420; color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cache Inspector Report</h1>
    <div class="meta">${graph.meta.appDir} &bull; ${new Date(graph.meta.scannedAt).toLocaleString()}</div>
    
    <div class="grid">
      <div class="card"><h3>Routes</h3><div class="value">${graph.routes.length}</div></div>
      <div class="card"><h3>Tags</h3><div class="value">${graph.tags.length}</div></div>
      <div class="card"><h3>Fetches</h3><div class="value">${graph.routes.reduce((s, r) => s + r.fetches.length, 0)}</div></div>
      <div class="card"><h3>Issues</h3><div class="value">${graph.antiPatterns.length}</div></div>
    </div>

    <h2>Routes</h2>
    <table>
      <thead><tr><th>Path</th><th>Type</th><th>Fetches</th></tr></thead>
      <tbody>
        ${graph.routes.map(r => `
          <tr>
            <td>${r.path}</td>
            <td><span class="badge ${r.type}">${r.type}</span></td>
            <td>${r.fetches.length}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    ${graph.antiPatterns.length > 0 ? `
    <h2>Issues</h2>
    <table>
      <thead><tr><th>Severity</th><th>Rule</th><th>Message</th><th>File</th></tr></thead>
      <tbody>
        ${graph.antiPatterns.map(p => `
          <tr>
            <td><span class="badge ${p.severity}">${p.severity}</span></td>
            <td>${p.rule}</td>
            <td>${p.message}</td>
            <td>${p.sourceFile}:${p.line}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    ` : ""}
  </div>
</body>
</html>`;
}

async function run(): Promise<number> {
  try {
    const options = await parseCliOptions();
    
    if (options.clean) {
      const projectRoot = path.resolve(options.dir);
      process.stdout.write(`${chalk.cyan("Cleaning inspector files")} ${chalk.white(projectRoot)}\n\n`);
      await cleanInspectorFiles(projectRoot);
      process.stdout.write(`\n${chalk.green("Cleanup complete")}\n`);
      return 0;
    }
    
    const { projectRoot, appDir } = await resolveTargetPaths(options.dir);

    process.stdout.write(`${chalk.cyan("Scanning")} ${chalk.white(appDir)}\n`);

    const graph = await analyze(appDir);
    const graphPath = getOutputFilePath(projectRoot, options.output);

    await writeGraph(graph, graphPath);

    process.stdout.write(`${chalk.green("Graph written")} ${chalk.white(graphPath)}\n`);

    if (options.export) {
      await generateReport(graph, options.export, projectRoot);
      return 0;
    }

    if (options.embed) {
      printEmbedInstructions(projectRoot, graphPath);
      return 0;
    }

    if (options.watch) {
      process.stdout.write(`${chalk.cyan("Watch mode enabled")} ${chalk.white("(Press Ctrl+C to stop)")}\n`);
      
      // Initial scan and start server
      const serverPromise = startStandaloneServer(options.port, graphPath, projectRoot);
      
      // Watch for changes
      const watcher = watch(appDir, { recursive: true }, async (eventType, filename) => {
        if (filename && (filename.endsWith(".tsx") || filename.endsWith(".ts") || filename.endsWith(".jsx") || filename.endsWith(".js"))) {
          process.stdout.write(`\n${chalk.yellow("File changed")} ${chalk.white(filename)} ${chalk.cyan("- Rescanning...")}\n`);
          try {
            const newGraph = await analyze(appDir);
            await writeGraph(newGraph, graphPath);
            process.stdout.write(`${chalk.green("Graph updated")} ${chalk.white(graphPath)}\n`);
          } catch (err) {
            process.stderr.write(`${chalk.red("Rescan failed")}: ${err}\n`);
          }
        }
      });
      
      // Handle cleanup on exit
      process.on("SIGINT", () => {
        watcher.close();
        process.exit(0);
      });
      
      return serverPromise;
    }

    process.stdout.write(`${chalk.cyan("Starting dashboard")} ${chalk.white(`http://localhost:${options.port}`)}\n`);
    return startStandaloneServer(options.port, graphPath, projectRoot);
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
