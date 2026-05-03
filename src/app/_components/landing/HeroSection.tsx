"use client";

import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useCallback, useState } from "react";
import DashboardMockup from "./DashboardMockup";

export default function HeroSection(): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText("npm install -g next-cache-inspector");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, []);

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-4xl">
            Inspect your{" "}
            <span className="text-[#FFC000]">Next.js cache</span>
          </h1>
          <p className="text-base leading-relaxed text-zinc-400 md:text-lg">
            Visualize, analyze, and debug your App Router caching strategy with
            static analysis. No runtime instrumentation required.
          </p>

          <div className="flex flex-row flex-wrap items-center gap-3">
            <Link
              href="/topology"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#FFC000] px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00]"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex min-w-0 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3">
              <code className="truncate font-mono text-[13px] text-zinc-300">
                npm install -g next-cache-inspector
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Copy install command"
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
