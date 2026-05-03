# Project Brief: next-cache-inspector

## Mission

Build an open-source developer tool that makes Next.js App Router caching fully observable. It uses static analysis to scan a target project's `app/` directory, builds a complete graph of its caching topology (routes, fetches, tags, revalidators), and renders an interactive dashboard for debugging and manual cache invalidation.

## Target User

- Senior Next.js developers debugging stale data, ISR misses, or tag revalidation chains.
- DevOps engineers verifying caching strategies in production apps.
- Open-source contributors who want to understand App Router internals.

## Success Criteria

- [ ] Scans any Next.js `app/` directory in under 3 seconds.
- [ ] Builds a complete, typed JSON graph of all routes, fetch calls, cache tags, and revalidation triggers.
- [ ] Renders an interactive topology map using React Flow with color-coded route types.
- [ ] Detects and surfaces at least 5 cache anti-patterns with inline warnings.
- [ ] Provides one-click manual revalidation (`revalidateTag`, `revalidatePath`) directly from the UI.
- [ ] Ships as both a standalone CLI tool and an embeddable dashboard route (`/_cache`).
- [ ] Works without runtime instrumentation — pure static analysis only.

## Non-Goals

- **No Pages Router support.** App Router only.
- **No runtime fetch wrapping or monkey-patching.** We analyze code, we don't intercept network calls.
- **No code editing from the dashboard.** Read-only inspector, not an IDE.
- **No generic route visualizer.** This is cache-specific, not a sitemap builder.
- **No authentication or multi-tenancy.** Single-user local dev tool.

## Key Differentiators

- The only open-source tool dedicated to visualizing Next.js cache layers (Full Route Cache, Data Cache, Request Memoization, Router Cache) in one place.
- Bridges the gap between Next.js 15/16's powerful but opaque caching APIs and developer understanding.

## Repository

- **Name:** `next-cache-inspector`
- **License:** MIT
- **Primary Language:** TypeScript (strict)
- **Runtime:** Node.js 18+
