"use client";

import { useMemo } from "react";
import {
  ArrowDownToLine,
  GitBranch,
  Network,
  ShieldAlert,
  Tag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { RouteType, Severity, CacheGraph, FetchCall } from "@/types";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

function StatCard({ label, value, icon: Icon, href, color }: StatCardProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-[#333] bg-[#111] p-4 transition-colors hover:bg-[#1a1a1a]"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-semibold text-white">{value}</div>
        <div className="text-[13px] text-gray-400">{label}</div>
      </div>
    </Link>
  );
}

function RouteTypeBar({ routes }: { routes: { type: RouteType }[] }): React.JSX.Element {
  const counts = useMemo(() => {
    const map: Record<RouteType, number> = { static: 0, dynamic: 0, ISR: 0, PPR: 0 };
    routes.forEach((r) => {
      map[r.type] = (map[r.type] ?? 0) + 1;
    });
    return map;
  }, [routes]);

  const total = routes.length;
  if (total === 0) {
    return (
      <div className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h3 className="mb-4 text-sm font-medium text-white">Route Types</h3>
        <p className="text-[13px] text-gray-500">No routes scanned yet.</p>
      </div>
    );
  }

  const items: { type: RouteType; count: number; color: string }[] = [
    { type: "static", count: counts.static, color: "#10b981" },
    { type: "dynamic", count: counts.dynamic, color: "#3b82f6" },
    { type: "ISR", count: counts.ISR, color: "#f59e0b" },
    { type: "PPR", count: counts.PPR, color: "#a855f7" },
  ];

  return (
    <div className="rounded-lg border border-[#333] bg-[#111] p-6">
      <h3 className="mb-4 text-sm font-medium text-white">Route Types</h3>
      <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[#0a0a0a]">
        {items.map((item) =>
          item.count > 0 ? (
            <div
              key={item.type}
              className="transition-all duration-500"
              style={{
                width: `${(item.count / total) * 100}%`,
                backgroundColor: item.color,
              }}
              title={`${item.type}: ${item.count}`}
            />
          ) : null
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.type} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[13px] capitalize text-gray-300">{item.type}</span>
            <span className="ml-auto font-mono text-[13px] text-gray-500">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AntiPatternSummary({ antiPatterns }: { antiPatterns: { severity: Severity }[] }): React.JSX.Element {
  const counts = useMemo(() => {
    const warnings = antiPatterns.filter((a) => a.severity === "warning").length;
    const errors = antiPatterns.filter((a) => a.severity === "error").length;
    return { warnings, errors, total: antiPatterns.length };
  }, [antiPatterns]);

  return (
    <div className="rounded-lg border border-[#333] bg-[#111] p-6">
      <h3 className="mb-4 text-sm font-medium text-white">Anti-Patterns</h3>
      {counts.total === 0 ? (
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-[13px]">No issues detected</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-[13px] text-gray-300">Warnings</span>
            </div>
            <span className="font-mono text-[13px] text-amber-400">{counts.warnings}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span className="text-[13px] text-gray-300">Errors</span>
            </div>
            <span className="font-mono text-[13px] text-red-400">{counts.errors}</span>
          </div>
          <div className="h-px bg-[#333]" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-400">Total</span>
            <span className="font-mono text-[13px] text-white">{counts.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentActivity({ graph }: { graph: CacheGraph }): React.JSX.Element {
  const recentFetches = useMemo(() => {
    return graph.routes
      .flatMap((r) => r.fetches.map((f: FetchCall) => ({ ...f, routePath: r.path })))
      .slice(0, 5);
  }, [graph]);

  return (
    <div className="rounded-lg border border-[#333] bg-[#111] p-6">
      <h3 className="mb-4 text-sm font-medium text-white">Recent Fetches</h3>
      {recentFetches.length === 0 ? (
        <p className="text-[13px] text-gray-500">No fetch calls found.</p>
      ) : (
        <div className="space-y-2">
          {recentFetches.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md bg-[#0a0a0a] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[11px] text-gray-300">
                  {item.url || "Dynamic URL"}
                </div>
                <div className="text-[10px] text-gray-500">{item.routePath}</div>
              </div>
              {item.cache && (
                <span className="ml-2 shrink-0 rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-gray-400">
                  {item.cache}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardViewClient(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);

  if (!graph) return null;

  const totalFetches = graph.routes.reduce((sum, r) => sum + r.fetches.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Routes"
          value={graph.routes.length}
          icon={Network}
          href="/topology"
          color="#10b981"
        />
        <StatCard
          label="Cache Tags"
          value={graph.tags.length}
          icon={Tag}
          href="/tags"
          color="#3b82f6"
        />
        <StatCard
          label="Fetch Calls"
          value={totalFetches}
          icon={ArrowDownToLine}
          href="/fetches"
          color="#f59e0b"
        />
        <StatCard
          label="Revalidators"
          value={graph.revalidators.length}
          icon={GitBranch}
          href="/flow"
          color="#a855f7"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RouteTypeBar routes={graph.routes} />
        <AntiPatternSummary antiPatterns={graph.antiPatterns} />
      </div>

      {/* Recent Activity */}
      <RecentActivity graph={graph} />

      {/* Scan Info */}
      <div className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h3 className="mb-3 text-sm font-medium text-white">Scan Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-[11px] text-gray-500">Scanned at</div>
              <div className="text-[13px] text-gray-300">
                {new Date(graph.meta.scannedAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-[11px] text-gray-500">App directory</div>
              <div className="truncate font-mono text-[13px] text-gray-300">{graph.meta.appDir}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-[11px] text-gray-500">Version</div>
              <div className="text-[13px] text-gray-300">{graph.meta.version}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
