"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowDownToLine,
  ChevronDown,
  GitBranch,
  Network,
  RefreshCw,
  ShieldAlert,
  Tag,
} from "lucide-react";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { InspectorView } from "@/app/_store/inspectorStore";

interface NavigationItem {
  href: `/${InspectorView}`;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: InspectorView;
  shortcut: string;
}

const navigationItems: NavigationItem[] = [
  { href: "/topology", icon: Network, label: "Topology", view: "topology", shortcut: "⌘1" },
  { href: "/tags", icon: Tag, label: "Tags", view: "tags", shortcut: "⌘2" },
  { href: "/fetches", icon: ArrowDownToLine, label: "Fetches", view: "fetches", shortcut: "⌘3" },
  { href: "/flow", icon: GitBranch, label: "Flow", view: "flow", shortcut: "⌘4" },
  { href: "/rules", icon: ShieldAlert, label: "Rules", view: "rules", shortcut: "⌘5" },
];

interface SidebarProps {
  onRescan: () => void;
  isRescanning: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
}

function getProjectName(appDir: string | undefined): string {
  if (!appDir) {
    return "No project scanned";
  }

  const parts = appDir.split(/[\\/]/);
  const last = parts[parts.length - 1];

  if (!last) {
    return "Unknown";
  }

  return last;
}

function formatScanTime(scannedAt: string | undefined): string {
  if (!scannedAt) {
    return "--";
  }

  try {
    return new Date(scannedAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

export default function Sidebar({
  onRescan,
  isRescanning,
  mobileOpen,
  onCloseMobile,
  collapsed,
}: SidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const graph = useInspectorStore((state) => state.graph);
  const setView = useInspectorStore((state) => state.setView);
  const [metaOpen, setMetaOpen] = useState(false);

  const projectName = getProjectName(graph?.meta.appDir);

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[15] bg-zinc-950/95 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`
          fixed left-0 top-0 z-20 flex h-screen shrink-0 flex-col border-r border-zinc-800 bg-zinc-900
          transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-16 w-[280px]" : "w-[280px]"}
        `}
      >
        {/* Brand */}
        <div
          className={`
            flex h-[72px] shrink-0 border-b border-zinc-800
            ${collapsed ? "items-center justify-center px-0" : "flex-col justify-center px-4"}
          `}
        >
          {collapsed ? (
            <img
              src="/logo.png"
              alt="next-cache-inspector"
              className="h-8 w-8 shrink-0 rounded-md"
            />
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="next-cache-inspector logo"
                  className="h-8 w-8 shrink-0 rounded-md"
                />
                <span className="text-xs font-medium tracking-wider text-zinc-300">
                  next-cache-inspector
                </span>
              </div>
              <p
                className="mt-1 truncate text-[11px] text-zinc-500"
                title={graph?.meta.appDir ?? undefined}
              >
                {projectName}
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={`mt-3 flex-1 px-3 ${collapsed ? "" : "overflow-y-auto"}`} aria-label="Primary">
          {!collapsed && (
            <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Views
            </div>
          )}

          <div className="flex flex-col gap-[2px]">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(): void => {
                    setView(item.view);
                    onCloseMobile();
                  }}
                  aria-label={collapsed ? item.label : undefined}
                  className={`
                    group relative flex h-8 select-none items-center transition-colors duration-150 ease-out
                    ${collapsed ? "justify-center px-0" : ""}
                    ${isActive
                      ? "border-l-2 border-l-[#FFC000] bg-zinc-800 text-zinc-100"
                      : "border-l-2 border-l-transparent text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    }
                  `}
                >
                  <Icon
                    className={`
                      shrink-0 h-4 w-4
                      ${collapsed ? "ml-0 mr-0" : "ml-3 mr-2.5"}
                      ${isActive ? "text-[#FFC000]" : "text-zinc-400"}
                    `}
                  />
                  {!collapsed && (
                    <>
                      <span className="text-[13px] font-medium">{item.label}</span>
                      <span
                        className={`
                          ml-auto mr-3 font-mono text-[10px]
                          ${isActive
                            ? "text-zinc-400"
                            : "text-zinc-600 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          }
                        `}
                      >
                        {item.shortcut}
                      </span>
                    </>
                  )}
                  {collapsed && (
                    <span className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 shadow-lg ring-1 ring-zinc-700 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 opacity-0">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {!collapsed && <div className="my-3 h-px bg-zinc-800" />}

          {/* Meta section */}
          {!collapsed && (
            <div>
              <button
                type="button"
                onClick={(): void => setMetaOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-400"
              >
                <span>Scan Meta</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${metaOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ gridTemplateRows: metaOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-2 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">Scanned</span>
                      <span className="text-[11px] text-zinc-500">
                        {formatScanTime(graph?.meta.scannedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">Routes</span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {graph?.routes.length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">Tags</span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {graph?.tags.length ?? 0}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onRescan}
                      disabled={isRescanning}
                      className="mt-1 flex h-7 w-full items-center justify-center gap-1.5 rounded-md text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:text-zinc-600"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRescanning ? "animate-spin" : ""}`} />
                      <span>Rescan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom status bar */}
        <div
          className={`
            flex h-12 shrink-0 items-center border-t border-zinc-800
            ${collapsed ? "justify-center px-0" : "justify-between px-4"}
          `}
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${graph ? "bg-emerald-500" : "bg-amber-500"}`} />
            {!collapsed && (
              <span className="text-[11px] text-zinc-500">
                {graph ? "Connected" : "Empty"}
              </span>
            )}
          </div>
          {!collapsed && <span className="font-mono text-[10px] text-zinc-600">v0.1.0</span>}
        </div>
      </aside>
    </>
  );
}
