"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  Folder,
  FolderOpen,
  Loader2,
  Radar,
} from "lucide-react";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph } from "@/types";

const RECENT_PROJECTS_KEY = "nci-recent-projects";
const MAX_RECENT = 5;

const PROGRESS_MESSAGES = [
  "Parsing routes...",
  "Analyzing fetches...",
  "Building graph...",
  "Finalizing...",
];

function getRecentProjects(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function addRecentProject(path: string): void {
  if (typeof window === "undefined") return;
  const recent = getRecentProjects();
  const filtered = recent.filter((p) => p !== path);
  const next = [path, ...filtered].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(next));
}

export default function ScanScreen(): React.JSX.Element {
  const router = useRouter();
  const setGraph = useInspectorStore((s) => s.setGraph);
  const [appDir, setAppDir] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [progressIndex, setProgressIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecentProjects());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isLoading) {
      setProgressIndex(0);
      progressTimerRef.current = setInterval(() => {
        setProgressIndex((prev) => {
          if (prev >= PROGRESS_MESSAGES.length - 1) return prev;
          return prev + 1;
        });
      }, 800);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isLoading]);

  const runScan = useCallback(
    async (path: string) => {
      const trimmed = path.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appDir: trimmed }),
        });

        const payload = (await response.json()) as {
          graph?: CacheGraph;
          error?: string;
        };

        if (!response.ok || !payload.graph) {
          setError(payload.error ?? "Scan failed. Please check the path and try again.");
          setIsLoading(false);
          return;
        }

        addRecentProject(trimmed);
        setRecent(getRecentProjects());
        setGraph(payload.graph);
        router.push("/topology");
      } catch {
        setError("Network error. Please try again.");
        setIsLoading(false);
      }
    },
    [isLoading, router, setGraph],
  );

  const handleSubmit = useCallback((): void => {
    runScan(appDir);
  }, [appDir, runScan]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit],
  );

  const handleCopyInstall = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText("npm install -g next-cache-inspector");
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    } catch {
      // ignore
    }
  }, []);

  const handleCopyRun = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText("next-cache-inspector --dir ./your-app");
      setCopiedRun(true);
      setTimeout(() => setCopiedRun(false), 2000);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] w-full flex-col items-center justify-center bg-[#111] px-4">
      <div className="w-full max-w-[480px] rounded-lg border border-[#333] bg-[#111] p-8">
        <div className="space-y-6">
          {/* Icon + Title Block */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#333] bg-[#1a1a1a]">
              <Radar className="h-6 w-6 text-[#FFC000]" strokeWidth={1.5} />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-white">
              Inspect your cache
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
              Select a Next.js project to analyze its App Router caching strategy.
            </p>
          </div>

          {/* Path Input + CTA */}
          <div className="space-y-3">
            <div className="relative">
              <FolderOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                ref={inputRef}
                type="text"
                value={appDir}
                onChange={(e) => setAppDir(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="./my-app"
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 pl-9 font-mono text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#FFC000] disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!appDir.trim() || isLoading}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#FFC000] text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00] disabled:cursor-not-allowed disabled:bg-[#1a1a1a] disabled:text-gray-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Start Inspection</span>
                </>
              )}
            </button>
          </div>

          {/* Recent Projects */}
          {recent.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                Recent
              </div>
              <div className="flex flex-col gap-[2px]">
                {recent.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => runScan(path)}
                    disabled={isLoading}
                    className="group flex h-8 items-center justify-between rounded-md px-2 transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                      <span className="truncate font-mono text-[13px] text-gray-300">
                        {path}
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-600 transition-colors group-hover:text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CLI Installation */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Or install via CLI
            </p>

            <div className="space-y-2">
              <div className="relative">
                <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-2.5 font-mono text-[12px] text-gray-300 select-all">
                  npm install -g next-cache-inspector
                </div>
                <button
                  type="button"
                  onClick={handleCopyInstall}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-gray-300"
                  aria-label="Copy install command"
                  title={copiedInstall ? "Copied!" : "Copy"}
                >
                  {copiedInstall ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-2.5 font-mono text-[12px] text-gray-300 select-all">
                  next-cache-inspector --dir ./your-app
                </div>
                <button
                  type="button"
                  onClick={handleCopyRun}
                  className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-gray-300"
                  aria-label="Copy run command"
                  title={copiedRun ? "Copied!" : "Copy"}
                >
                  {copiedRun ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <a
              href="https://www.npmjs.com/package/next-cache-inspector"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 transition-colors hover:text-[#FFC000]"
            >
              <BookOpen className="h-3 w-3" />
              <span>Documentation</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Status / Error Area */}
      <div className="mt-4 h-6">
        {isLoading && (
          <p className="text-sm text-gray-400">
            {PROGRESS_MESSAGES[progressIndex]}
          </p>
        )}
        {error && !isLoading && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
