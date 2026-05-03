# Engine Specification

The Engine is a pure Node.js/TypeScript static analysis module. It reads the target project's `app/` directory, parses TypeScript ASTs using `ts-morph`, and emits a `CacheGraph`. It never executes target code and never writes to the target project.

---

## Entry Point (`src/engine/analyzer.ts`)

### `analyze(appDir: string): Promise<CacheGraph>`

The main orchestrator. Execution flow:

1. Validate `appDir` exists and contains at least one `page.tsx` or `layout.tsx`.
2. Initialize `ts-morph Project` with compiler options suitable for Next.js.
3. Discover all relevant files: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`.
4. Run parsers in parallel per file (or sequentially if shared AST state is needed).
5. Pass raw results to `graphBuilder.ts`.
6. Return the final `CacheGraph`.

### ts-morph Configuration

```ts
const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    allowJs: false,
    strict: true,
  },
});
```

- Add files individually via `project.addSourceFileAtPath(filePath)`.
- Do NOT add `node_modules` or `.next/`.
- If a file fails to parse, log the error and skip it (do not crash the scan).

---

## Route Parser (`src/engine/parsers/routeParser.ts`)

### `parseRouteFile(sourceFile: SourceFile): RouteNode | null`

Responsibilities:

- Determine if the file is a route, layout, or route handler.
- Extract exported segment configuration.
- Detect `generateStaticParams` presence.
- Map file path to URL path.

### File-to-URL Mapping

| File Path                      | URL Path       |
| ------------------------------ | -------------- |
| `app/page.tsx`                 | `/`            |
| `app/blog/page.tsx`            | `/blog`        |
| `app/blog/[slug]/page.tsx`     | `/blog/[slug]` |
| `app/(shop)/products/page.tsx` | `/products`    |
| `app/api/webhook/route.ts`     | `/api/webhook` |

Rules:

- Strip `(group)` segments from URL path.
- Keep `[param]` and `[[...catchall]]` in URL path.
- `route.ts` files become their directory path as URL.

### Segment Config Extraction

Look for variable declarations exported from the module:

```ts
export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const fetchCache = "default-no-store";
```

AST strategy:

- Find `VariableStatement` nodes with `isExported()`.
- Match name against `dynamic`, `revalidate`, `fetchCache`.
- Extract initializer literal value.
- For `revalidate`, accept `number` or `false` only.

### Route Type Determination

```ts
function determineRouteType(
  segmentConfig: RouteNode["segmentConfig"],
  hasDynamicParams: boolean,
  hasGenerateStaticParams: boolean,
  isPprEnabled: boolean,
  usesSuspense: boolean,
): RouteType;
```

Priority order:

1. `segmentConfig.dynamic === 'force-dynamic'` → `dynamic`
2. `hasDynamicParams && !hasGenerateStaticParams` → `dynamic`
3. `segmentConfig.revalidate !== undefined && segmentConfig.revalidate !== false` → `ISR`
4. `isPprEnabled && usesSuspense` → `PPR`
5. Default → `static`

---

## Fetch Parser (`src/engine/parsers/fetchParser.ts`)

### `parseFetches(sourceFile: SourceFile): FetchCall[]`

Responsibilities:

- Find all `fetch()` call expressions in the file.
- Extract the second argument (RequestInit / NextFetchRequestConfig).
- Read `next: { revalidate, tags, cache }`.

### AST Traversal

1. Find all `CallExpression` nodes where expression text is `fetch`.
2. If call has 2+ arguments, inspect argument at index 1.
3. Look for `ObjectLiteralExpression` with property `next`.
4. Inside `next`, extract:
   - `revalidate`: `NumericLiteral` or `FalseKeyword`
   - `tags`: `ArrayLiteralExpression` containing `StringLiteral` elements
   - `cache`: `StringLiteral` with value `'force-cache'` or `'no-store'`
5. For `tags`, if array contains variables or expressions, skip non-literals (do not crash).

### URL Extraction (Optional)

If first argument is a `StringLiteral`, capture it as `url`. If it is a template literal with no expressions, capture the raw text. Otherwise leave `url` undefined.

### Edge Cases

- `fetch` aliased: `const myFetch = fetch; myFetch(...)` — skip (too complex).
- `fetch` wrapped: `await fetcher()` where `fetcher` calls `fetch` internally — skip (only direct calls).
- Multiple `fetch` calls on one line — distinguish by AST node start position.

---

## Revalidate Parser (`src/engine/parsers/revalidateParser.ts`)

### `parseRevalidators(sourceFile: SourceFile): Revalidator[]`

Responsibilities:

- Find calls to `revalidateTag()`, `revalidatePath()`, and `updateTag()`.
- Extract the first argument (target string).
- Record source file and line number.

### AST Traversal

1. Find all `CallExpression` nodes.
2. Match expression text against `revalidateTag`, `revalidatePath`, `updateTag`.
3. Inspect first argument:
   - If `StringLiteral`, capture value.
   - If template literal with no expressions, capture raw text.
   - Otherwise, set target to `unknown` and flag in debug log.
4. Map function name to `RevalidatorType`:
   - `revalidateTag` → `tag`
   - `updateTag` → `tag`
   - `revalidatePath` → `path`

### Scope Detection

Only scan files that are likely to contain these calls:

- `route.ts` (Route Handlers)
- Files containing `'use server'` (Server Actions)
- `pages/api/*` (legacy API routes, optional support)

---

## Graph Builder (`src/engine/graphBuilder.ts`)

### `buildGraph(raw: RawScanResult): CacheGraph`

Responsibilities:

- Deduplicate tags across all routes.
- Cross-reference tags to routes and revalidators.
- Run anti-pattern rules.
- Assemble final `CacheGraph`.

### Deduplication

Tags are deduplicated by exact string match. Case-sensitive.

### Cross-Referencing

For each `CacheTag`:

- `usedBy`: collect all `RouteNode.id` where `FetchCall.tags` includes this tag.
- `invalidatedBy`: collect all `Revalidator.id` where `Revalidator.target` equals this tag name (or path, for path revalidators).

### Layout Inheritance

For each route, identify wrapping layouts by walking up the directory tree:

- At each level, if `layout.tsx` exists, add its relative path to `layouts`.
- Order: root first, leaf last.

---

## Anti-Pattern Rules (`src/engine/rules/antiPatterns.ts`)

### `runRules(graph: CacheGraph): AntiPattern[]`

Each rule is a pure function: `(graph) => AntiPattern[]`.

### Rule Definitions

#### 1. `no-store-with-revalidate`

Trigger: `FetchCall.cache === 'no-store'` AND `FetchCall.revalidate` is defined (any value).

Message: `fetch() uses cache: 'no-store' with revalidate. These options conflict — no-store disables caching entirely.`

Severity: `error`

#### 2. `isr-untagged-fetch`

Trigger: `RouteNode.type === 'ISR'` AND any `FetchCall` in that route has `tags.length === 0`.

Message: `ISR route has untagged fetch. Without tags, you cannot revalidate this fetch precisely.`

Severity: `warning`

#### 3. `orphan-revalidate-tag`

Trigger: `Revalidator.type === 'tag'` AND `Revalidator.target` does not exist in any `CacheTag.name`.

Message: `revalidateTag('${target}') targets a tag that is never used in any fetch().`

Severity: `warning`

#### 4. `force-dynamic-with-revalidate`

Trigger: `RouteNode.segmentConfig.dynamic === 'force-dynamic'` AND `RouteNode.segmentConfig.revalidate` is defined.

Message: `Route exports both force-dynamic and revalidate. force-dynamic disables static generation; revalidate has no effect.`

Severity: `error`

#### 5. `layout-fetch-conflict`

Trigger: Two layout files in the same route tree fetch the same `url` with different `cache` or `revalidate` values.

Message: `Conflicting fetch configurations for ${url} in parent and child layouts.`

Severity: `warning`

---

## Error Handling

- **Parse failures:** Log to stderr, skip file, continue scan.
- **Missing `app/` directory:** Throw clear error: `No app/ directory found at ${path}. This tool only supports Next.js App Router.`
- **Empty scan:** Return valid `CacheGraph` with empty arrays and meta. Do not throw.

---

## Performance Targets

- Scan 100-route project in < 3 seconds on M1 Mac.
- Memory usage < 200MB for typical project.
- Do not hold full AST in memory after parsing each file — extract data and release.
