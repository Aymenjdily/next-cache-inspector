"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useInspectorStore } from "@/app/_store/inspectorStore";

type ThemePreference = "system" | "light" | "dark";

export default function SettingsPage(): React.JSX.Element {
  const graph = useInspectorStore((state) => state.graph);
  const setGraph = useInspectorStore((state) => state.setGraph);

  const [theme, setTheme] = useState<ThemePreference>("system");
  const [showHiddenViews, setShowHiddenViews] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nci-theme") as ThemePreference | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleThemeChange = (value: ThemePreference): void => {
    setTheme(value);
    localStorage.setItem("nci-theme", value);
    setToast("Theme preference saved");
  };

  const handleClearData = (): void => {
    setGraph(null);
    localStorage.removeItem("nci-app-dir");
    localStorage.removeItem("nci-recent-projects");
    setClearConfirm(false);
    setToast("All scan data cleared");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-lg font-medium text-white">Settings</h1>
        <p className="mt-1 text-[13px] text-gray-500">Configure your inspector preferences.</p>
      </div>

      {/* Appearance */}
      <section className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: "light", icon: Sun, label: "Light" },
            { value: "dark", icon: Moon, label: "Dark" },
            { value: "system", icon: Monitor, label: "System" },
          ] as const).map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`flex flex-col items-center gap-2 rounded-md border px-4 py-3 transition-colors ${
                  active
                    ? "border-[#FFC000] bg-[#FFC000]/10 text-[#FFC000]"
                    : "border-[#333] text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[13px]">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dashboard */}
      <section className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Dashboard</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-gray-300">Show hidden views</div>
            <div className="text-[11px] text-gray-500">Display experimental or advanced inspector views.</div>
          </div>
          <button
            type="button"
            onClick={() => setShowHiddenViews((v) => !v)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              showHiddenViews
                ? "bg-[#FFC000]/10 text-[#FFC000]"
                : "text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300"
            }`}
          >
            {showHiddenViews ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Data Management</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-gray-300">Clear scan data</div>
              <div className="text-[11px] text-gray-500">
                {graph
                  ? `Remove ${graph.routes.length} routes, ${graph.tags.length} tags, and all associated data.`
                  : "No scan data currently loaded."}
              </div>
            </div>
            {!clearConfirm ? (
              <button
                type="button"
                onClick={() => setClearConfirm(true)}
                disabled={!graph}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[13px] text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClearConfirm(false)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#333] px-3 py-1.5 text-[13px] text-gray-400 transition-colors hover:bg-[#1a1a1a]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-[13px] text-white transition-colors hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="rounded-lg border border-[#333] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-medium text-white">About</h2>
        <div className="space-y-2 text-[13px] text-gray-400">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-mono text-gray-500">v0.1.5</span>
          </div>
          <div className="flex justify-between">
            <span>Next.js</span>
            <span className="font-mono text-gray-500">v15.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>React</span>
            <span className="font-mono text-gray-500">v19.0.0</span>
          </div>
        </div>
      </section>
    </div>
  );
}
