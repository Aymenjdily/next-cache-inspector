"use client";

import { AlertTriangle, ArrowDownUp, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { AntiPattern, FetchCall, RouteNode } from "@/types";

type FetchSortKey = "sourceFile" | "revalidate" | "tagCount";
type CacheFilter = "all" | "force-cache" | "no-store" | "unset";
type RouteTypeFilter = "all" | RouteNode["type"];

interface FetchRowData {
  route: RouteNode;
  fetchCall: FetchCall;
  warnings: AntiPattern[];
}

function getVsCodeHref(sourceFile: string): string {
  return `vscode://file/${sourceFile}`;
}

function getFetchWarnings(graphAntiPatterns: AntiPattern[], fetchCall: FetchCall): AntiPattern[] {
  return graphAntiPatterns.filter(
    (antiPattern) =>
      antiPattern.sourceFile === fetchCall.sourceFile &&
      (antiPattern.line === fetchCall.line || antiPattern.rule === "isr-untagged-fetch"),
  );
}

function compareRows(left: FetchRowData, right: FetchRowData, sortKey: FetchSortKey): number {
  if (sortKey === "revalidate") {
    const leftValue = typeof left.fetchCall.revalidate === "number" ? left.fetchCall.revalidate : Number.MAX_SAFE_INTEGER;
    const rightValue =
      typeof right.fetchCall.revalidate === "number" ? right.fetchCall.revalidate : Number.MAX_SAFE_INTEGER;

    return leftValue - rightValue;
  }

  if (sortKey === "tagCount") {
    return right.fetchCall.tags.length - left.fetchCall.tags.length;
  }

  return left.fetchCall.sourceFile.localeCompare(right.fetchCall.sourceFile);
}

export default function FetchesViewClient(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);
  const [sortKey, setSortKey] = useState<FetchSortKey>("sourceFile");
  const [routeTypeFilter, setRouteTypeFilter] = useState<RouteTypeFilter>("all");
  const [cacheFilter, setCacheFilter] = useState<CacheFilter>("all");
  const [hasWarningsOnly, setHasWarningsOnly] = useState<boolean>(false);

  const rows = useMemo(() => {
    if (!graph) {
      return [];
    }

    return graph.routes.flatMap((route) =>
      route.fetches.map((fetchCall) => ({
        route,
        fetchCall,
        warnings: getFetchWarnings(graph.antiPatterns, fetchCall),
      })),
    );
  }, [graph]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => (routeTypeFilter === "all" ? true : row.route.type === routeTypeFilter))
      .filter((row) => {
        if (cacheFilter === "all") {
          return true;
        }

        if (cacheFilter === "unset") {
          return row.fetchCall.cache === undefined;
        }

        return row.fetchCall.cache === cacheFilter;
      })
      .filter((row) => (hasWarningsOnly ? row.warnings.length > 0 : true))
      .sort((left, right) => compareRows(left, right, sortKey));
  }, [cacheFilter, hasWarningsOnly, routeTypeFilter, rows, sortKey]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, FetchRowData[]>();

    filteredRows.forEach((row) => {
      const currentGroup = groups.get(row.route.id) ?? [];
      currentGroup.push(row);
      groups.set(row.route.id, currentGroup);
    });

    return [...groups.entries()];
  }, [filteredRows]);

  if (!graph) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <select
          value={routeTypeFilter}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
            setRouteTypeFilter(event.target.value as RouteTypeFilter);
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <option value="all">All route types</option>
          <option value="static">Static</option>
          <option value="dynamic">Dynamic</option>
          <option value="ISR">ISR</option>
          <option value="PPR">PPR</option>
        </select>

        <select
          value={cacheFilter}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
            setCacheFilter(event.target.value as CacheFilter);
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <option value="all">All cache strategies</option>
          <option value="force-cache">force-cache</option>
          <option value="no-store">no-store</option>
          <option value="unset">unset</option>
        </select>

        <select
          value={sortKey}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
            setSortKey(event.target.value as FetchSortKey);
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        >
          <option value="sourceFile">Sort: source file</option>
          <option value="revalidate">Sort: revalidate</option>
          <option value="tagCount">Sort: tag count</option>
        </select>

        <label className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={hasWarningsOnly}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              setHasWarningsOnly(event.target.checked);
            }}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-[#FFC000]"
          />
          <span>Has warnings only</span>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="grid grid-cols-[2.2fr_1.5fr_1fr_1fr_1.5fr_0.6fr] gap-4 border-b border-zinc-800 px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          <span className="inline-flex items-center gap-2">
            Source File
            <ArrowDownUp className="h-3.5 w-3.5" />
          </span>
          <span>URL</span>
          <span>Cache</span>
          <span>Revalidate</span>
          <span>Tags</span>
          <span>Warnings</span>
        </div>

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
          {groupedRows.map(([routeId, routeRows]) => (
            <section key={routeId}>
              <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 px-4 py-2">
                <p className="font-mono text-xs text-zinc-50">{routeRows[0].route.path}</p>
                <p className="text-sm text-zinc-400">{routeId}</p>
              </div>

              {routeRows.map((row) => (
                <div
                  key={row.fetchCall.id}
                  className="grid grid-cols-[2.2fr_1.5fr_1fr_1fr_1.5fr_0.6fr] gap-4 border-b border-zinc-800 px-4 py-3 text-sm text-zinc-300"
                >
                  <a
                    href={getVsCodeHref(row.fetchCall.sourceFile)}
                    className="inline-flex min-w-0 items-center gap-2 font-mono text-xs text-zinc-200 transition-colors hover:text-[#FFC000]"
                  >
                    <span className="truncate">{row.fetchCall.sourceFile}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <span className="truncate font-mono text-xs text-zinc-300">{row.fetchCall.url ?? "dynamic url"}</span>
                  <span>{row.fetchCall.cache ?? "--"}</span>
                  <span>{row.fetchCall.revalidate ?? "--"}</span>
                  <span className="truncate font-mono text-xs text-zinc-300">
                    {row.fetchCall.tags.length > 0 ? row.fetchCall.tags.join(", ") : "--"}
                  </span>
                  <span>
                    {row.warnings.length > 0 ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : null}
                  </span>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
