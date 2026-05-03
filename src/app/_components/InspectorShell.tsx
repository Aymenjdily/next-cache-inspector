"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Menu,
  Moon,
  RefreshCw,
  Settings,
  Sun,
  Trash2,
  X,
} from "lucide-react";

import { getSavedAppDir, saveAppDir } from "@/app/_lib/appDirStorage";
import ScanScreen from "@/app/_components/ScanScreen";
import Sidebar from "@/app/_components/Sidebar";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph } from "@/types";

function getViewName(pathname: string): string {
  if (pathname === "/topology") return "Topology";
  if (pathname === "/tags") return "Tags";
  if (pathname === "/fetches") return "Fetches";
  if (pathname === "/flow") return "Flow";
  if (pathname === "/rules") return "Rules";
  return "Dashboard";
}

export default function InspectorShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const pathname = usePathname();
  const graph = useInspectorStore((state) => state.graph);
  const setGraph = useInspectorStore((state) => state.setGraph);
  const setView = useInspectorStore((state) => state.setView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [savedAppDir, setSavedAppDir] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const stored = getSavedAppDir();
    if (stored) {
      setSavedAppDir(stored);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  useEffect((): void => {
    const viewMap: Record<string, "topology" | "tags" | "fetches" | "flow" | "rules"> = {
      "/topology": "topology",
      "/tags": "tags",
      "/fetches": "fetches",
      "/flow": "flow",
      "/rules": "rules",
    };
    const matched = viewMap[pathname];
    if (matched) {
      setView(matched);
    }
  }, [pathname, setView]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  const targetAppDir = graph?.meta.appDir ?? savedAppDir;
  const canRefresh = Boolean(targetAppDir);

  const handleRescan = (): void => {
    if (!canRefresh || isPending) {
      return;
    }

    startTransition(async (): Promise<void> => {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDir: targetAppDir }),
      });

      const payload = (await response.json()) as { graph?: CacheGraph; error?: string };

      if (!response.ok || !payload.graph) {
        return;
      }

      saveAppDir(targetAppDir);
      setSavedAppDir(targetAppDir);
      setGraph(payload.graph);
    });
  };

  const handleToggleCollapse = (): void => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleToggleTheme = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleClearData = (): void => {
    setGraph(undefined as unknown as CacheGraph);
    localStorage.removeItem("nci-app-dir");
    setSavedAppDir("");
    setSettingsOpen(false);
  };

  const viewName = getViewName(pathname);

  const ThemeIcon = mounted && resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <Sidebar
        onRescan={handleRescan}
        isRescanning={isPending}
        mobileOpen={mobileOpen}
        onCloseMobile={(): void => setMobileOpen(false)}
        collapsed={collapsed}
      />

      <div
        className={`
          flex min-w-0 flex-1 flex-col
          transition-[padding] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "lg:pl-16" : "lg:pl-[280px]"}
        `}
      >
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(): void => setMobileOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <h1 className="text-sm font-medium text-zinc-100">{viewName}</h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRescan}
              disabled={!canRefresh || isPending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-600"
              aria-label="Refresh graph"
              title="Refresh graph"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={(): void => setSettingsOpen((prev) => !prev)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 ${settingsOpen ? "bg-zinc-800 text-zinc-100" : ""}`}
                aria-label="Settings"
                title="Settings"
                aria-expanded={settingsOpen}
              >
                <Settings className="h-4 w-4" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-xl">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-zinc-300">Settings</span>
                    <button
                      type="button"
                      onClick={(): void => setSettingsOpen(false)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="my-1 h-px bg-zinc-800" />

                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <Info className="h-3 w-3" />
                      <span>next-cache-inspector v0.1.0</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearData}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-red-400 transition-colors hover:bg-zinc-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear scan data</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              aria-label={mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 bg-zinc-950 p-6">
          {graph ? children : <ScanScreen />}
        </main>
      </div>
    </div>
  );
}
