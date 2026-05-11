"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

interface RouteData {
  id: string;
  path: string;
  type: "static" | "dynamic" | "ISR" | "PPR";
  segmentConfig: Record<string, unknown>;
  fetches: Array<{
    url?: string;
    cache?: string;
    revalidate?: number | false;
    tags: string[];
  }>;
}

interface CacheTag {
  name: string;
  usedBy: string[];
}

interface AntiPattern {
  severity: "warning" | "error";
  message: string;
  rule: string;
  sourceFile: string;
  line: number;
}

interface CacheData {
  routes: RouteData[];
  tags: CacheTag[];
  revalidators: Array<{ type: string; target: string }>;
  antiPatterns: AntiPattern[];
  meta: {
    appDir: string;
    scannedAt: string;
    version: string;
  };
}

type Tab = "overview" | "routes" | "tags" | "fetches" | "issues";

const routeTypeColors: Record<string, string> = {
  static: "#10b981",
  dynamic: "#3b82f6",
  ISR: "#f59e0b",
  PPR: "#a855f7",
};

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${
        active
          ? "bg-[#FFC000] text-[#111]"
          : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-[#333] bg-[#111] p-3">
      <div className="text-2xl font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function OverviewTab({ data }: { data: CacheData }): React.JSX.Element {
  const routeTypeCounts = useMemo(() => {
    return data.routes.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [data.routes]);

  const totalFetches = data.routes.reduce((sum, r) => sum + r.fetches.length, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Routes" value={data.routes.length} color="#10b981" />
        <StatCard label="Tags" value={data.tags.length} color="#3b82f6" />
        <StatCard label="Fetches" value={totalFetches} color="#f59e0b" />
        <StatCard label="Issues" value={data.antiPatterns.length} color="#ef4444" />
      </div>

      <div className="rounded-lg border border-[#333] bg-[#111] p-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Route Types</h3>
        <div className="space-y-2">
          {Object.entries(routeTypeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: routeTypeColors[type] || "#666" }}
              />
              <span className="text-sm text-gray-300">{type}</span>
              <div className="ml-auto flex-1 mx-2 h-1.5 rounded-full bg-[#0a0a0a]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(count / data.routes.length) * 100}%`,
                    backgroundColor: routeTypeColors[type] || "#666",
                  }}
                />
              </div>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {data.antiPatterns.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-red-400">Issues Detected</h3>
          <div className="space-y-2">
            {data.antiPatterns.slice(0, 3).map((pattern, i) => (
              <div key={i} className="text-sm text-red-300">
                • {pattern.message}
              </div>
            ))}
            {data.antiPatterns.length > 3 && (
              <div className="text-xs text-red-400/60">+{data.antiPatterns.length - 3} more...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoutesTab({ routes }: { routes: RouteData[] }): React.JSX.Element {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return routes;
    return routes.filter(
      (r) =>
        r.path.toLowerCase().includes(filter.toLowerCase()) ||
        r.type.toLowerCase().includes(filter.toLowerCase())
    );
  }, [routes, filter]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Filter routes..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-md border border-[#333] bg-[#0a0a0a] px-3 py-1.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#FFC000]"
      />

      <div className="space-y-1 max-h-[400px] overflow-auto">
        {filtered.map((route) => (
          <div
            key={route.id}
            className="flex items-center justify-between rounded-md border border-[#333] bg-[#111] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: routeTypeColors[route.type] || "#666" }}
              />
              <span className="text-sm text-gray-300">{route.path}</span>
            </div>
            <div className="flex items-center gap-2">
              {route.fetches.length > 0 && (
                <span className="text-xs text-gray-500">{route.fetches.length} fetches</span>
              )}
              <span className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-xs text-gray-400">
                {route.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagsTab({ tags }: { tags: CacheTag[] }): React.JSX.Element {
  return (
    <div className="space-y-2 max-h-[450px] overflow-auto">
      {tags.map((tag) => (
        <div key={tag.name} className="rounded-md border border-[#333] bg-[#111] p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#FFC000]">{tag.name}</span>
            <span className="text-xs text-gray-500">{tag.usedBy.length} routes</span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            {tag.usedBy.slice(0, 3).join(", ")}
            {tag.usedBy.length > 3 && ` +${tag.usedBy.length - 3} more`}
          </div>
        </div>
      ))}
    </div>
  );
}

function FetchesTab({ routes }: { routes: RouteData[] }): React.JSX.Element {
  const fetches = useMemo(() => {
    return routes.flatMap((r) =>
      r.fetches.map((f) => ({ ...f, routePath: r.path }))
    );
  }, [routes]);

  return (
    <div className="space-y-2 max-h-[450px] overflow-auto">
      {fetches.map((fetch, i) => (
        <div key={i} className="rounded-md border border-[#333] bg-[#111] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{fetch.url || "Dynamic URL"}</span>
            {fetch.cache && (
              <span className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-xs text-gray-400">
                {fetch.cache}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">{fetch.routePath}</div>
          {fetch.tags.length > 0 && (
            <div className="mt-1 flex gap-1">
              {fetch.tags.map((tag) => (
                <span key={tag} className="rounded bg-[#FFC000]/10 px-1.5 py-0.5 text-xs text-[#FFC000]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IssuesTab({ antiPatterns }: { antiPatterns: AntiPattern[] }): React.JSX.Element {
  return (
    <div className="space-y-2 max-h-[450px] overflow-auto">
      {antiPatterns.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-emerald-400">
          ✓ No issues detected
        </div>
      ) : (
        antiPatterns.map((pattern, i) => (
          <div
            key={i}
            className={`rounded-md border p-3 ${
              pattern.severity === "error"
                ? "border-red-500/30 bg-red-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  pattern.severity === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {pattern.severity}
              </span>
              <span className="text-sm font-medium text-gray-300">{pattern.rule}</span>
            </div>
            <div className="mt-1 text-sm text-gray-400">{pattern.message}</div>
            <div className="mt-1 text-xs text-gray-600">
              {pattern.sourceFile}:{pattern.line}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CacheInspector(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [data, setData] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try 1: Call the scan API endpoint
      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appDir: "./src/app" }),
        });
        
        if (response.ok) {
          const result = (await response.json()) as { graph?: CacheData; error?: string };
          if (result.graph) {
            setData(result.graph);
            return;
          }
        }
      } catch {
        // API not available, try next method
      }
      
      // Try 2: Read cached graph from filesystem (generated by CLI)
      try {
        const response = await fetch("/.next/cache-inspector/cache-graph.json");
        if (response.ok) {
          const graph = (await response.json()) as CacheData;
          setData(graph);
          return;
        }
      } catch {
        // Cached file not available
      }
      
      // If we get here, both methods failed
      setError("No scan data found. Run: npx next-cache-inspector --dir .");
    } catch {
      setError("Failed to load cache data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !data && !loading && !error) {
      void scan();
    }
  }, [isOpen, data, loading, error, scan]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
          isOpen ? "bg-red-500" : "bg-[#FFC000]"
        }`}
        title={isOpen ? "Close Inspector" : "Open Cache Inspector"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isOpen ? "text-white" : "text-[#111]"}
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </>
          )}
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9998] flex h-[600px] w-[520px] flex-col overflow-hidden rounded-xl border border-[#333] bg-[#0a0a0a] shadow-2xl">
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#333] px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Cache Inspector</span>
              {data && (
                <span className="rounded bg-[#1a1a1a] px-1.5 py-0.5 text-xs text-gray-500">
                  {data.routes.length} routes
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={scan}
              disabled={loading}
              className="rounded bg-[#FFC000] px-3 py-1 text-xs font-medium text-[#111] transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Rescan"}
            </button>
          </div>

          {/* Tabs */}
          {data && (
            <div className="flex gap-1 border-b border-[#333] px-4 py-2">
              <TabButton active={activeTab === "overview"} label="Overview" onClick={() => setActiveTab("overview")} />
              <TabButton active={activeTab === "routes"} label="Routes" onClick={() => setActiveTab("routes")} />
              <TabButton active={activeTab === "tags"} label="Tags" onClick={() => setActiveTab("tags")} />
              <TabButton active={activeTab === "fetches"} label="Fetches" onClick={() => setActiveTab("fetches")} />
              <TabButton active={activeTab === "issues"} label="Issues" onClick={() => setActiveTab("issues")} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {error && (
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
                  {error}
                </div>
                <div className="rounded-lg border border-[#333] bg-[#111] p-4 text-sm text-gray-400">
                  <p className="mb-3 font-medium text-white">How to use:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Option 1: Run the CLI scanner (generates cache data)</p>
                      <pre className="rounded bg-[#0a0a0a] p-2 font-mono text-xs text-gray-300">
                        npx next-cache-inspector --dir .
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Option 2: Add a scan API route to your app</p>
                      <pre className="rounded bg-[#0a0a0a] p-2 font-mono text-xs text-gray-300">
                        {`// app/api/scan/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { appDir } = await req.json();
  
  // You can import the analyzer here if needed
  // Or return cached data
  
  return NextResponse.json({ 
    graph: { routes: [], tags: [], antiPatterns: [] }
  });
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && !data && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[#333] border-t-[#FFC000] mx-auto" />
                  <div className="text-sm text-gray-400">Scanning your project...</div>
                </div>
              </div>
            )}

            {data && (
              <>
                {activeTab === "overview" && <OverviewTab data={data} />}
                {activeTab === "routes" && <RoutesTab routes={data.routes} />}
                {activeTab === "tags" && <TagsTab tags={data.tags} />}
                {activeTab === "fetches" && <FetchesTab routes={data.routes} />}
                {activeTab === "issues" && <IssuesTab antiPatterns={data.antiPatterns} />}
              </>
            )}
          </div>

          {/* Footer */}
          {data && (
            <div className="shrink-0 border-t border-[#333] px-4 py-2 text-xs text-gray-600">
              Scanned: {new Date(data.meta.scannedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export { CacheInspector };
export default CacheInspector;
