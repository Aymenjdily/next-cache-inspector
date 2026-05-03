"use client";

import { Copy, Check } from "lucide-react";
import { useCallback, useState } from "react";

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
    <section id="install" className="border-t border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Get started in seconds
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Install globally once. Use it on any Next.js project.
          </p>

          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            <div className="flex items-center justify-between rounded-md bg-zinc-950 px-4 py-3">
              <code className="font-mono text-sm text-zinc-300">
                npm install -g next-cache-inspector
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-4 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Copy install command"
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 text-left">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Then run
            </p>
            <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3">
              <code className="font-mono text-sm text-zinc-300">
                next-cache-inspector --dir ./your-app
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
