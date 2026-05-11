"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderSearch,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Zap,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph } from "@/types";

export default function OnboardingPage(): React.JSX.Element {
  const router = useRouter();
  const setGraph = useInspectorStore((state) => state.setGraph);

  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (): Promise<void> => {
    if (!path.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDir: path.trim() }),
      });

      const payload = (await response.json()) as {
        graph?: CacheGraph;
        error?: string;
      };

      if (!response.ok || !payload.graph) {
        setError(payload.error || "Scan failed. Please check the path and try again.");
        return;
      }

      localStorage.setItem("nci-app-dir", path.trim());
      setGraph(payload.graph);
      router.push("/dashboard");
    } catch {
      setError("Network error. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      void handleScan();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111] px-6 text-gray-100">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC000]/10">
            <Zap className="h-6 w-6 text-[#FFC000]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to next-cache-inspector</h1>
          <p className="mt-2 text-[15px] text-gray-400">
            Let's get your project set up for analysis.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8 space-y-4">
          {[
            {
              icon: FolderSearch,
              title: "Point to your app directory",
              description: "Enter the absolute or relative path to your Next.js app/ folder.",
            },
            {
              icon: Search,
              title: "Run the scan",
              description: "We'll analyze all routes, fetches, tags, and cache configurations.",
            },
            {
              icon: ShieldAlert,
              title: "Review insights",
              description: "Explore the dashboard and fix any caching anti-patterns we detect.",
            },
          ].map((step, index) => (
            <div key={step.title} className="flex gap-4 rounded-lg border border-[#333] bg-[#111] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[13px] font-medium text-[#FFC000]">
                {index + 1}
              </div>
              <div className="mt-0.5">
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-[13px] font-medium text-white">{step.title}</span>
                </div>
                <p className="mt-1 text-[12px] text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="rounded-lg border border-[#333] bg-[#111] p-6">
          <label htmlFor="app-dir" className="mb-2 block text-[13px] font-medium text-gray-300">
            App directory path
          </label>
          <div className="flex gap-2">
            <input
              id="app-dir"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. ./my-app or C:\\Users\\me\\project\\src\\app"
              className="min-w-0 flex-1 rounded-md border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#FFC000]"
            />
            <button
              type="button"
              onClick={() => void handleScan()}
              disabled={loading || !path.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#FFC000] px-4 py-2 text-sm font-medium text-[#111] transition-colors hover:bg-[#e6ac00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <p className="mt-3 text-[11px] text-gray-600">
            Example: ./examples/my-app or an absolute path to your app/ directory.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[12px] text-gray-600">
            Already scanned?{" "}
            <a href="/dashboard" className="text-[#FFC000] hover:underline">
              Go to Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
