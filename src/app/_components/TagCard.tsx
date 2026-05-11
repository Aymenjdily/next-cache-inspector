"use client";

import { ChevronDown, ChevronRight, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useState, useTransition } from "react";

import { revalidateTagAction } from "@/app/_actions/revalidate";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import { isEmbeddedMode } from "@/lib/runtimeMode";
import type { CacheTag, Revalidator, RouteNode } from "@/types";

export interface TagCardToast {
  id: string;
  tone: "success" | "error";
  message: string;
}

interface TagCardProps {
  tag: CacheTag;
  linkedRoutes: RouteNode[];
  linkedRevalidators: Revalidator[];
  onToast: (toast: TagCardToast) => void;
}

export default function TagCard({
  tag,
  linkedRoutes,
  linkedRevalidators,
  onToast,
}: Readonly<TagCardProps>): React.JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const selectedTagName = useInspectorStore((state) => state.selectedTagName);
  const selectTag = useInspectorStore((state) => state.selectTag);
  const setHighlightMode = useInspectorStore((state) => state.setHighlightMode);
  const embeddedMode = isEmbeddedMode();

  return (
    <article
      className={`rounded-lg border bg-[#111] p-4 transition-colors ${
        selectedTagName === tag.name ? "border-[#FFC000]/40 ring-1 ring-[#FFC000]/40" : "border-[#333]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={(): void => {
            selectTag(tag.name);
            setHighlightMode("tag");
          }}
          className="min-w-0 text-left"
        >
          <p className="truncate font-mono text-xs font-medium text-white">{tag.name}</p>
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded border border-[#333] bg-[#1a1a1a] px-1.5 py-0.5 text-[11px] font-medium text-gray-300">
            Used by {linkedRoutes.length} routes
          </span>
          <span className="rounded border border-[#333] bg-[#1a1a1a] px-1.5 py-0.5 text-[11px] font-medium text-gray-300">
            Invalidated by {linkedRevalidators.length} actions
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={(): void => setExpanded((currentValue) => !currentValue)}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-400 transition-colors hover:bg-[#1a1a1a] hover:text-gray-200"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span>{expanded ? "Hide links" : "Show links"}</span>
        </button>

        <button
          type="button"
          disabled={!embeddedMode || isPending}
          title={!embeddedMode ? "Revalidation requires embedded mode." : undefined}
          onClick={(): void => {
            startTransition(async (): Promise<void> => {
              try {
                const result = await revalidateTagAction(tag.name);
                if (!result.success) {
                  onToast({
                    id: `${tag.name}-${Date.now()}`,
                    tone: "error",
                    message: result.error ?? "Revalidation requires embedded mode.",
                  });
                  return;
                }
                onToast({
                  id: `${tag.name}-${Date.now()}`,
                  tone: "success",
                  message: `Revalidated tag "${tag.name}" successfully.`,
                });
              } catch {
                onToast({
                  id: `${tag.name}-${Date.now()}`,
                  tone: "error",
                  message: `Failed to revalidate tag "${tag.name}".`,
                });
              }
            });
          }}
          className="inline-flex h-8 items-center gap-2 rounded-md bg-[#FFC000] px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00] disabled:cursor-not-allowed disabled:bg-[#1a1a1a] disabled:text-gray-500"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          <span>Revalidate Now</span>
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 border-t border-[#333] pt-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white">Routes</p>
            <div className="mt-3 space-y-2">
              {linkedRoutes.length === 0 ? (
                <p className="text-sm text-gray-500">No linked routes.</p>
              ) : (
                linkedRoutes.map((route) => (
                  <div key={route.id} className="rounded-md border border-[#333] bg-[#0a0a0a] p-3">
                    <p className="font-mono text-xs text-white">{route.path}</p>
                    <p className="mt-1 text-sm text-gray-400">{route.id}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Revalidators</p>
            <div className="mt-3 space-y-2">
              {linkedRevalidators.length === 0 ? (
                <p className="text-sm text-gray-500">No revalidation actions.</p>
              ) : (
                linkedRevalidators.map((revalidator) => (
                  <div key={revalidator.id} className="rounded-md border border-[#333] bg-[#0a0a0a] p-3">
                    <p className="font-mono text-xs text-white">{revalidator.target}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {revalidator.sourceFile}:{revalidator.line}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function TagToastList({
  toasts,
}: Readonly<{
  toasts: TagCardToast[];
}>): React.JSX.Element {
  if (toasts.length === 0) return <></>;

  return (
    <div className="fixed right-6 top-20 z-40 flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
            toast.tone === "success"
              ? "border-emerald-500/20 bg-[#111] text-emerald-400"
              : "border-red-500/20 bg-[#111] text-red-400"
          }`}
        >
          {toast.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
          <p className="text-sm">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
