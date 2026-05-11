"use client";

import {
  Search,
  GitBranch,
  Layers,
  ShieldAlert,
  RefreshCw,
  Zap,
  Terminal,
  Eye,
} from "lucide-react";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Search,
    title: "Static Analysis",
    description:
      "Parse routes, fetches, and revalidators without running your app. Zero runtime overhead.",
  },
  {
    icon: GitBranch,
    title: "Interactive Topology",
    description:
      "Visualize your route tree as a directed graph. Pan, zoom, and inspect any segment.",
  },
  {
    icon: Layers,
    title: "Cache Tag Flow",
    description:
      "See how revalidators propagate through tags to routes. Understand blast radius at a glance.",
  },
  {
    icon: ShieldAlert,
    title: "Anti-Pattern Detection",
    description:
      "Catch caching mistakes before production. Rules for ISR, dynamic, and fetch misconfigurations.",
  },
  {
    icon: RefreshCw,
    title: "Live Revalidation",
    description:
      "Watch revalidation events in real-time. Track which tags and paths are being refreshed.",
  },
  {
    icon: Zap,
    title: "Performance Metrics",
    description:
      "Measure cache hit rates, build times, and route staticness. Optimize with data.",
  },
  {
    icon: Terminal,
    title: "CLI & API",
    description:
      "Run scans from your terminal or integrate into CI. Full programmatic access.",
  },
  {
    icon: Eye,
    title: "Visual Dashboard",
    description:
      "Explore everything in a clean, interactive web UI. No config required.",
  },
];

export default function FeaturesSection(): React.JSX.Element {
  return (
    <section id="features" className="border-t border-[#333] bg-[#111]">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Everything you need to
            <br />
            understand caching
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
            Track, analyze, and optimize your Next.js App Router caching strategy with static analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-[#333] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="border-b border-r border-[#333] bg-[#111] p-6 transition-colors hover:bg-[#1a1a1a]"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#333] bg-[#111]">
                  <Icon className="h-4 w-4 text-[#FFC000]" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
