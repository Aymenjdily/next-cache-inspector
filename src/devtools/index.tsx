"use client";

import React, { useState, useEffect, useCallback } from "react";

interface CacheData {
  routes: Array<{
    id: string;
    path: string;
    type: string;
    segmentConfig: Record<string, unknown>;
  }>;
  tags: Array<{ name: string; usedBy: string[] }>;
  antiPatterns: Array<{
    severity: string;
    message: string;
    rule: string;
    sourceFile: string;
  }>;
  meta: {
    appDir: string;
    scannedAt: string;
    version: string;
  };
}

function CacheInspector(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDir: "./src/app" }),
      });
      const result = (await response.json()) as { graph?: CacheData };
      if (result.graph) {
        setData(result.graph);
      } else {
        setError("Failed to scan project");
      }
    } catch {
      setError("Failed to connect to scanner");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !data && !loading) {
      void scan();
    }
  }, [isOpen, data, loading, scan]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 ${
          isOpen ? "bg-red-500 rotate-45" : "bg-[#FFC000]"
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
        <div className="fixed bottom-20 right-4 z-[9998] h-[600px] w-[480px] overflow-hidden rounded-xl border border-[#333] bg-[#111] shadow-2xl">
          <div className="flex h-10 items-center justify-between border-b border-[#333] px-4">
            <span className="text-sm font-medium text-white">Cache Inspector</span>
            <button
              type="button"
              onClick={scan}
              disabled={loading}
              className="rounded bg-[#FFC000] px-2 py-1 text-xs font-medium text-[#111] transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Rescan"}
            </button>
          </div>

          <div className="h-[calc(100%-40px)] overflow-auto p-4">
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {loading && !data && (
              <div className="flex h-full items-center justify-center">
                <div className="text-sm text-gray-400">Scanning project... Check console for details.</div>
              </div>
            )}

            {data && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#1a1a1a] p-3">
                    <div className="text-lg font-semibold text-white">{data.routes.length}</div>
                    <div className="text-xs text-gray-400">Routes</div>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] p-3">
                    <div className="text-lg font-semibold text-white">{data.tags.length}</div>
                    <div className="text-xs text-gray-400">Tags</div>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] p-3">
                    <div className="text-lg font-semibold text-white">{data.antiPatterns.length}</div>
                    <div className="text-xs text-gray-400">Issues</div>
                  </div>
                </div>

                {/* Route Types */}
                <div className="rounded-lg border border-[#333] bg-[#111] p-3">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Route Types</h3>
                  <div className="space-y-1">
                    {Object.entries(
                      data.routes.reduce(
                        (acc, r) => {
                          acc[r.type] = (acc[r.type] ?? 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-300">{type}</span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {data.tags.length > 0 && (
                  <div className="rounded-lg border border-[#333] bg-[#111] p-3">
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Cache Tags</h3>
                    <div className="space-y-1">
                      {data.tags.slice(0, 10).map((tag) => (
                        <div key={tag.name} className="flex items-center justify-between">
                          <span className="font-mono text-sm text-gray-300">{tag.name}</span>
                          <span className="text-xs text-gray-500">{tag.usedBy.length} routes</span>
                        </div>
                      ))}
                      {data.tags.length > 10 && (
                        <div className="text-xs text-gray-500">+{data.tags.length - 10} more...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Anti-patterns */}
                {data.antiPatterns.length > 0 && (
                  <div className="rounded-lg border border-[#333] bg-[#111] p-3">
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Issues</h3>
                    <div className="space-y-2">
                      {data.antiPatterns.slice(0, 5).map((pattern, i) => (
                        <div
                          key={i}
                          className={`rounded p-2 text-xs ${
                            pattern.severity === "error"
                              ? "border border-red-500/30 bg-red-500/10 text-red-400"
                              : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          <div className="font-medium">{pattern.rule}</div>
                          <div className="mt-1 text-gray-400">{pattern.message}</div>
                          <div className="mt-1 text-gray-600">{pattern.sourceFile}</div>
                        </div>
                      ))}
                      {data.antiPatterns.length > 5 && (
                        <div className="text-xs text-gray-500">+{data.antiPatterns.length - 5} more...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="rounded-lg border border-[#333] bg-[#111] p-3 text-xs text-gray-500">
                  <div>Scanned: {new Date(data.meta.scannedAt).toLocaleString()}</div>
                  <div>Version: {data.meta.version}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export { CacheInspector };
export default CacheInspector;
