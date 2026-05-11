"use client";

import { ExternalLink, RefreshCw, X } from "lucide-react";
import { useState, useTransition } from "react";

import { revalidatePathAction } from "@/app/_actions/revalidate";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import { isEmbeddedMode } from "@/lib/runtimeMode";
import type { AntiPattern, CacheGraph, CacheTag, RouteNode } from "@/types";

function getRouteSourcePath(graph: CacheGraph, route: RouteNode): string {
  if (route.fetches[0]?.sourceFile) return route.fetches[0].sourceFile;
  return `${graph.meta.appDir.replace(/\\/g, "/")}/${route.id}`;
}

function getRouteTags(graph: CacheGraph, route: RouteNode): CacheTag[] {
  return graph.tags.filter((tag) => tag.usedBy.includes(route.id));
}

function getRouteAntiPatterns(graph: CacheGraph, route: RouteNode): AntiPattern[] {
  const routeSourcePath = getRouteSourcePath(graph, route);
  const fetchSourceFiles = new Set(route.fetches.map((fetchCall) => fetchCall.sourceFile));
  return graph.antiPatterns.filter(
    (antiPattern) =>
      antiPattern.sourceFile === routeSourcePath || fetchSourceFiles.has(antiPattern.sourceFile),
  );
}

function getVsCodeHref(sourcePath: string): string {
  return `vscode://file/${sourcePath}`;
}

export default function DetailSidebar({
  graph,
  route,
}: Readonly<{
  graph: CacheGraph;
  route: RouteNode;
}>): React.JSX.Element {
  const selectRoute = useInspectorStore((state) => state.selectRoute);
  const [revalidateMessage, setRevalidateMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const routeSourcePath = getRouteSourcePath(graph, route);
  const tags = getRouteTags(graph, route);
  const antiPatterns = getRouteAntiPatterns(graph, route);
  const embeddedMode = isEmbeddedMode();

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-80 flex-col border-l border-[#333] bg-[#111]">
      <div className="flex items-start justify-between border-b border-[#333] p-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-[13px] font-medium text-white">{route.path}</p>
          <p className="mt-1 text-sm text-gray-400">{route.id}</p>
        </div>

        <button
          type="button"
          onClick={(): void => selectRoute(null)}
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-gray-200"
          aria-label="Close route details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">Segment Config</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!embeddedMode || isPending}
                title={!embeddedMode ? "Revalidation requires embedded mode." : undefined}
                onClick={(): void => {
                  startTransition(async (): Promise<void> => {
                    const result = await revalidatePathAction(route.path);
                    setRevalidateMessage(
                      result.success
                        ? `Revalidated path "${route.path}".`
                        : (result.error ?? "Revalidation requires embedded mode."),
                    );
                  });
                }}
                className="inline-flex h-8 items-center gap-2 rounded-md bg-[#FFC000] px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00] disabled:cursor-not-allowed disabled:bg-[#1a1a1a] disabled:text-gray-500"
              >
                <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                <span>Revalidate Path</span>
              </button>
              <a
                href={getVsCodeHref(routeSourcePath)}
                className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in VS Code</span>
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm text-gray-300">
            <p>dynamic: {route.segmentConfig.dynamic ?? "--"}</p>
            <p className="mt-2">revalidate: {route.segmentConfig.revalidate ?? "--"}</p>
            <p className="mt-2">fetchCache: {route.segmentConfig.fetchCache ?? "--"}</p>
            {revalidateMessage ? <p className="mt-3 text-sm text-gray-400">{revalidateMessage}</p> : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Fetch Calls</h2>
          <div className="space-y-3">
            {route.fetches.length === 0 ? (
              <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm text-gray-500">
                No fetch calls found for this route.
              </div>
            ) : (
              route.fetches.map((fetchCall) => (
                <div key={fetchCall.id} className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm text-gray-300">
                  <p className="font-mono text-xs text-white">{fetchCall.url ?? "dynamic url"}</p>
                  <p className="mt-2">cache: {fetchCall.cache ?? "--"}</p>
                  <p className="mt-2">revalidate: {fetchCall.revalidate ?? "--"}</p>
                  <p className="mt-2 font-mono text-xs text-gray-400">
                    tags: {fetchCall.tags.length > 0 ? fetchCall.tags.join(", ") : "--"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Linked Tags</h2>
          <div className="space-y-2">
            {tags.length === 0 ? (
              <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm text-gray-500">
                No cache tags linked to this route.
              </div>
            ) : (
              tags.map((tag) => (
                <div key={tag.name} className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4">
                  <p className="font-mono text-xs text-white">{tag.name}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Anti-Patterns</h2>
          <div className="space-y-2">
            {antiPatterns.length === 0 ? (
              <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4 text-sm text-gray-500">
                No anti-patterns associated with this route.
              </div>
            ) : (
              antiPatterns.map((antiPattern) => (
                <div key={antiPattern.id} className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{antiPattern.rule}</p>
                  <p className="mt-2 text-sm text-gray-200">{antiPattern.message}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
