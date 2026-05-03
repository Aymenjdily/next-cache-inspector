"use client";

import {
  GitBranch,
  Layers,
  Search,
  ShieldAlert,
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
];

export default function FeaturesSection(): React.JSX.Element {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Everything you need to understand caching
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Four views, one complete picture.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950">
                <Icon className="h-4 w-4 text-[#FFC000]" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
