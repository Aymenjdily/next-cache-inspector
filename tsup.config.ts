import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { cli: "src/cli/index.ts" },
    outDir: "dist",
    format: "esm",
    platform: "node",
    target: "node18",
    bundle: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ["ts-morph", "typescript"],
    // The source file already has a shebang; tsup preserves it.
  },
  {
    entry: { devtools: "src/devtools/index.tsx" },
    outDir: "dist",
    format: "esm",
    platform: "browser",
    target: "es2020",
    bundle: true,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean, CLI build already ran
    dts: false,
    external: ["react", "react-dom"],
  },
]);
