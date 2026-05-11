"use client";

import { useMemo } from "react";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { AntiPattern } from "@/types";

function getSeverityBadgeClassName(severity: AntiPattern["severity"]): string {
  if (severity === "error") {
    return "border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[11px] font-medium text-red-400";
  }
  return "border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-400";
}

function getVsCodeHref(sourceFile: string, line: number): string {
  return `vscode://file/${sourceFile}:${line}`;
}

export default function RulesViewClient(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);
  const antiPatternFilter = useInspectorStore((state) => state.antiPatternFilter);
  const setAntiPatternFilter = useInspectorStore((state) => state.setAntiPatternFilter);

  const filteredAntiPatterns = useMemo(() => {
    if (!graph) return [];
    if (antiPatternFilter === "all") return graph.antiPatterns;
    return graph.antiPatterns.filter((antiPattern) => antiPattern.severity === antiPatternFilter);
  }, [antiPatternFilter, graph]);

  const groupedAntiPatterns = useMemo(() => {
    const groups = new Map<string, AntiPattern[]>();
    filteredAntiPatterns.forEach((antiPattern) => {
      const currentGroup = groups.get(antiPattern.rule) ?? [];
      currentGroup.push(antiPattern);
      groups.set(antiPattern.rule, currentGroup);
    });
    return [...groups.entries()];
  }, [filteredAntiPatterns]);

  if (!graph) return null;

  const warningCount = graph.antiPatterns.filter((antiPattern) => antiPattern.severity === "warning").length;
  const errorCount = graph.antiPatterns.filter((antiPattern) => antiPattern.severity === "error").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-amber-500/20 bg-[#111] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-400">Warnings</p>
          <p className="mt-2 text-2xl font-semibold text-white">{warningCount}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-[#111] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-red-400">Errors</p>
          <p className="mt-2 text-2xl font-semibold text-white">{errorCount}</p>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-[#333] bg-[#111] p-2">
        {(["all", "warning", "error"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={(): void => setAntiPatternFilter(filter)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              antiPatternFilter === filter
                ? "bg-[#1a1a1a] text-white"
                : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200"
            }`}
          >
            {filter === "all" ? "All" : filter === "warning" ? "Warnings" : "Errors"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {groupedAntiPatterns.map(([ruleName, antiPatterns]) => (
          <section key={ruleName} className="rounded-lg border border-[#333] bg-[#111]">
            <div className="border-b border-[#333] px-4 py-3">
              <p className="font-mono text-xs text-white">{ruleName}</p>
            </div>

            <div className="space-y-3 p-4">
              {antiPatterns.map((antiPattern) => (
                <article key={antiPattern.id} className="rounded-lg border border-[#333] bg-[#0a0a0a] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={getSeverityBadgeClassName(antiPattern.severity)}>{antiPattern.severity}</span>
                    <span className="rounded border border-[#333] bg-[#1a1a1a] px-1.5 py-0.5 text-[11px] font-medium text-gray-300">
                      {antiPattern.rule}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-200">{antiPattern.message}</p>
                  <a
                    href={getVsCodeHref(antiPattern.sourceFile, antiPattern.line)}
                    className="mt-3 inline-flex font-mono text-xs text-gray-400 transition-colors hover:text-[#FFC000]"
                  >
                    {antiPattern.sourceFile}:{antiPattern.line}
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
