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

### Option 1: Embedded DevTools (Recommended)

Import the devtools component directly into your Next.js app. No separate server needed!

```bash
npm install next-cache-inspector
```

Add to your root layout:

```tsx
// app/layout.tsx
import { CacheInspector } from "next-cache-inspector/devtools";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === "development" && <CacheInspector />}
      </body>
    </html>
  );
}
```

This renders a floating button in development. Click it to see:
- Route count and types
- Cache tags
- Anti-patterns and issues
- Scan metadata

### Option 2: Standalone Dashboard

Start the inspector dashboard for any Next.js project:

```bash
npx next-cache-inspector --dir ./my-next-app
```

The dashboard opens at `http://localhost:4242`.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --dir <dir>` | Target Next.js project root | `process.cwd()` |
| `-p, --port <port>` | Port for the dashboard server | `4242` |
| `-o, --output <output>` | Output directory for cache-graph.json | `.next/cache-inspector/` |

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
