import { defineConfig } from "tsup";

export default defineConfig({
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
});
