"use client";

import { Copy, Check, ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import Link from "next/link";

export default function InstallSection(): React.JSX.Element {
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
    <section id="install" className="relative overflow-hidden border-t border-[#333] bg-[#111]">
      {/* Subtle radial glow behind */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-[#FFC000]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Get started in seconds
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
            Install globally once. Use it on any Next.js project.
          </p>

          <div className="mt-10 rounded-xl border border-[#333] bg-[#111] p-2 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-5 py-4">
              <code className="font-mono text-sm text-gray-300">
                npm install -g next-cache-inspector
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#333] bg-[#111] text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-gray-300"
                aria-label="Copy install command"
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="rounded-lg border border-[#333] bg-[#0a0a0a] px-5 py-3">
              <code className="font-mono text-sm text-gray-400">
                next-cache-inspector --dir ./your-app
              </code>
            </div>
            <Link
              href="/topology"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFC000] px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00]"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
