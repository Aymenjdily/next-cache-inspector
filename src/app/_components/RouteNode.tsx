"use client";

import type { Node, NodeProps } from "@xyflow/react";

import type { RouteNode as RouteNodeSchema } from "@/types";

export type RouteNodeData = RouteNodeSchema &
  Record<string, unknown> & {
    width: number;
    height: number;
    tagCount: number;
    sourcePath: string;
    isLayout?: boolean;
    onSelectRoute: (id: string) => void;
    onOpenSource: (sourcePath: string) => void;
  };

export type RouteFlowNode = Node<RouteNodeData>;

function getBadgeClassName(routeType: RouteNodeData["type"]): string {
  if (routeType === "dynamic") {
    return "border border-[#FFC000]/20 bg-[#FFC000]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#FFC000]";
  }

  if (routeType === "ISR") {
    return "border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-400";
  }

  if (routeType === "PPR") {
    return "border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-medium text-purple-400";
  }

  return "border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400";
}

export default function RouteNode({
  data,
  selected,
}: NodeProps<RouteFlowNode>): React.JSX.Element {
  const label = data.isLayout ? data.id : data.path;

  return (
    <button
      type="button"
      className={`flex h-20 w-60 origin-center flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-left transition duration-150 ease-out hover:scale-[1.02] ${
        selected ? "ring-2 ring-[#FFC000]" : ""
      }`}
      onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
        if (event.metaKey || event.ctrlKey) {
          data.onOpenSource(data.sourcePath);
          return;
        }

        data.onSelectRoute(data.id);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[13px] font-medium text-zinc-50">{label}</p>
        <span className={getBadgeClassName(data.type)}>{data.type}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span>{data.fetches.length} fetches</span>
        <span>{data.tagCount} tags</span>
      </div>
    </button>
  );
}
