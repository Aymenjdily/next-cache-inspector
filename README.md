# next-cache-inspector

Inspect and analyze Next.js App Router caching strategy.

## Installation

```bash
npm install -g next-cache-inspector
```

Or run directly with `npx`:

```bash
npx next-cache-inspector --dir ./your-app
```

## Usage

### Start the dashboard

```bash
next-cache-inspector --dir ./my-next-app
```

The dashboard opens at `http://localhost:4242` with an interactive UI.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --dir <dir>` | Target Next.js project root | `process.cwd()` |
| `-p, --port <port>` | Port for the dashboard server | `4242` |
| `-o, --output <output>` | Output directory for cache-graph.json | `.next/cache-inspector/` |
| `-w, --watch` | Watch for file changes and auto-rescan | `false` |
| `--export <format>` | Export report (html, json) | - |
| `--clean` | Remove temp directories and cache files | `false` |

### Watch mode

Auto-rescan when you edit files:

```bash
next-cache-inspector --dir ./my-app --watch
```

### Export reports

Generate shareable reports:

```bash
# HTML report
next-cache-inspector --dir ./my-app --export html

# JSON export
next-cache-inspector --dir ./my-app --export json
```

Reports are saved to your project directory.

### Cleaning up

Remove temp directories and cache files:

```bash
next-cache-inspector --dir ./my-app --clean
```

## What it does

1. **Scans** your Next.js `app/` directory for routes
2. **Analyzes** cache configurations (`export const revalidate`, `export const dynamic`, fetch options, etc.)
3. **Maps** fetch calls and their cache tags
4. **Detects** anti-patterns and caching inconsistencies
5. **Visualizes** everything in an interactive dashboard with tabs for:
   - **Overview** - Key metrics and route type distribution
   - **Routes** - All routes with their cache types
   - **Tags** - Cache tags and their usage
   - **Fetches** - Fetch calls with cache settings
   - **Issues** - Anti-patterns and warnings

## Requirements

- Node.js 18+
- Next.js project using the App Router

## License

MIT
