"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Menu,
  RefreshCw,
  Settings,
  Trash2,
  X,
} from "lucide-react";

import { getSavedAppDir, saveAppDir } from "@/app/_lib/appDirStorage";
import ScanScreen from "@/app/_components/ScanScreen";
import Sidebar from "@/app/_components/Sidebar";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { InspectorView } from "@/app/_store/inspectorStore";
import type { CacheGraph } from "@/types";

function getViewName(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/topology") return "Topology";
  if (pathname === "/tags") return "Tags";
  if (pathname === "/fetches") return "Fetches";
  if (pathname === "/flow") return "Flow";
  if (pathname === "/rules") return "Rules";
  if (pathname === "/settings") return "Settings";
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



  useEffect(() => {
    const stored = getSavedAppDir();
    if (stored) setSavedAppDir(stored);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  useEffect((): void => {
    const viewMap: Record<string, InspectorView> = {
      "/dashboard": "dashboard",
      "/topology": "topology",
      "/tags": "tags",
      "/fetches": "fetches",
      "/flow": "flow",
      "/rules": "rules",
    };
    const matched = viewMap[pathname];
    if (matched) setView(matched);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  const targetAppDir = graph?.meta.appDir ?? savedAppDir;
  const canRefresh = Boolean(targetAppDir);

  const handleRescan = (): void => {
    if (!canRefresh || isPending) return;
    startTransition(async (): Promise<void> => {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDir: targetAppDir }),
      });
      const payload = (await response.json()) as { graph?: CacheGraph; error?: string };
      if (!response.ok || !payload.graph) return;
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

  const handleClearData = (): void => {
    setGraph(undefined as unknown as CacheGraph);
    localStorage.removeItem("nci-app-dir");
    setSavedAppDir("");
    setSettingsOpen(false);
  };

  const viewName = getViewName(pathname);
  return (
    <div className="flex min-h-screen bg-[#111] text-gray-100">
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
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#333] bg-[#111] px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(): void => setMobileOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <h1 className="text-sm font-medium text-white">{viewName}</h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRescan}
              disabled={!canRefresh || isPending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:text-gray-600"
              aria-label="Refresh graph"
              title="Refresh graph"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            </button>

            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={(): void => setSettingsOpen((prev) => !prev)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-white ${settingsOpen ? "bg-[#1a1a1a] text-white" : ""}`}
                aria-label="Settings"
                title="Settings"
                aria-expanded={settingsOpen}
              >
                <Settings className="h-4 w-4" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[#333] bg-[#1a1a1a] p-1 shadow-xl">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-gray-300">Settings</span>
                    <button
                      type="button"
                      onClick={(): void => setSettingsOpen(false)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-500 transition-colors hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="my-1 h-px bg-[#333]" />

                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Info className="h-3 w-3" />
                      <span>next-cache-inspector v0.1.0</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearData}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-red-400 transition-colors hover:bg-[#252525]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear scan data</span>
                  </button>
                </div>
              )}
            </div>


          </div>
        </header>

        <main className="flex-1 bg-[#111] p-6">
          {graph ? children : <ScanScreen />}
        </main>
      </div>
    </div>
  );
}
