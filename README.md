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

### Standalone dashboard

Start the inspector dashboard for any Next.js project:

```bash
next-cache-inspector --dir ./my-next-app
```

The dashboard opens at `http://localhost:4242`.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --dir <dir>` | Target Next.js project root | `process.cwd()` |
| `-p, --port <port>` | Port for the dashboard server | `4242` |
| `-o, --output <output>` | Output directory for cache-graph.json | `.next/cache-inspector/` |
| `-e, --embed` | Print embed instructions instead of starting a server | `false` |

### Embedded mode

Mount the inspector inside your own Next.js app:

```bash
next-cache-inspector --dir ./my-next-app --embed
```

Follow the printed instructions to wire the dashboard into your app.

## What it does

1. **Scans** your Next.js `app/` directory for routes
2. **Analyzes** cache configurations (`export const revalidate`, `export const dynamic`, fetch options, etc.)
3. **Maps** fetch calls and their cache tags
4. **Detects** anti-patterns and caching inconsistencies
5. **Visualizes** everything in an interactive dashboard

## Requirements

- Node.js 18+
- Next.js project using the App Router

## License

MIT
