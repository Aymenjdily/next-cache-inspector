"use client";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  Github,
  Atom,
  Network,
  Search,
  ShieldCheck,
  Tag,
  ScanLine,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import ContributorsCarousel from "./ContributorsCarousel";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";

function NextJsIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="nextMask"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="180"
        height="180"
      >
        <circle cx="90" cy="90" r="90" fill="white" />
      </mask>
      <g mask="url(#nextMask)">
        <circle cx="90" cy="90" r="90" fill="black" />
        <path
          d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
          fill="white"
        />
        <path d="M115 54H127V126H115V54Z" fill="white" />
      </g>
    </svg>
  );
}

function ReactIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <Atom
      className={className}
      strokeWidth={2}
      style={{ color: "#61DAFB" }}
    />
  );
}

function RotatingTechBadge(): React.JSX.Element {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % 2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      aria-hidden="true"
      className="relative mx-1 inline-flex size-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10 sm:mx-1.5 sm:size-10"
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          index === 0
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-12"
        }`}
      >
        <NextJsIcon className="size-5 sm:size-6" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          index === 1
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 -rotate-12"
        }`}
      >
        <ReactIcon className="size-5 sm:size-6" />
      </span>
    </span>
  );
}

const tabs = [
  { id: "topology", label: "Cache Topology", icon: <Network className="size-4" /> },
  { id: "fetches", label: "Fetch Analysis", icon: <Search className="size-4" /> },
  { id: "rules", label: "Rules Engine", icon: <ShieldCheck className="size-4" /> },
  { id: "tags", label: "Tag System", icon: <Tag className="size-4" /> },
  { id: "scan", label: "Static Analysis", icon: <ScanLine className="size-4" /> },
];

function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-lg border border-[#333] border-b-0 bg-[#1a1a1a] shadow-2xl">
      <div className="flex h-7 shrink-0 items-center border-b border-[#333] bg-[#252525] px-3">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>
        <span className="flex-1 text-center text-[10px] font-medium text-gray-400">
          {title}
        </span>
        <div className="w-[42px]" />
      </div>
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function TopologyView(): React.JSX.Element {
  return (
    <BrowserChrome title="next-cache-inspector — Topology">
      <div className="hidden w-16 flex-col gap-3 border-r border-[#333] bg-[#1a1a1a] p-3 md:flex lg:w-[154px]">
        <div className="mx-auto h-6 w-6 rounded bg-gray-700 lg:mx-0 lg:h-5 lg:w-full" />
        <div className="mx-auto h-6 w-6 rounded bg-[#FFC000]/20 lg:mx-0 lg:h-5 lg:w-full" />
        <div className="mx-auto h-6 w-6 rounded bg-gray-700 lg:mx-0 lg:h-5 lg:w-full" />
        <div className="mx-auto h-6 w-6 rounded bg-gray-700 lg:mx-0 lg:h-5 lg:w-full" />
        <div className="mx-auto h-6 w-6 rounded bg-gray-700 lg:mx-0 lg:h-5 lg:w-full" />
      </div>
      <div className="flex-1 bg-[#1a1a1a] p-4">
        <svg viewBox="0 0 320 180" className="w-full" aria-hidden="true">
          <rect x="20" y="70" width="56" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="48" y="90" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/</text>
          <rect x="130" y="40" width="72" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="166" y="60" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/blog</text>
          <rect x="130" y="100" width="72" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="166" y="120" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/shop</text>
          <rect x="250" y="25" width="56" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="278" y="45" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/[id]</text>
          <rect x="250" y="70" width="56" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="278" y="90" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/cart</text>
          <rect x="250" y="115" width="56" height="32" rx="4" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <text x="278" y="135" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">/[id]</text>
          <line x1="76" y1="86" x2="130" y2="56" stroke="#555" strokeWidth="1.5" />
          <line x1="76" y1="86" x2="130" y2="116" stroke="#555" strokeWidth="1.5" />
          <line x1="202" y1="56" x2="250" y2="41" stroke="#555" strokeWidth="1.5" />
          <line x1="202" y1="116" x2="250" y2="131" stroke="#555" strokeWidth="1.5" />
          <rect x="100" y="150" width="120" height="20" rx="4" fill="#332a00" stroke="#FFC000" strokeWidth="1" opacity="0.7" />
          <text x="160" y="163" textAnchor="middle" fill="#FFC000" fontSize="9" fontFamily="monospace">tag: product-list</text>
        </svg>
      </div>
    </BrowserChrome>
  );
}

function FetchesView(): React.JSX.Element {
  const rows = [
    { method: "GET", path: "/api/products", status: "200", cache: "force-cache" },
    { method: "POST", path: "/api/cart", status: "200", cache: "no-store" },
    { method: "GET", path: "/api/user", status: "200", cache: "revalidate" },
    { method: "GET", path: "/api/search", status: "200", cache: "force-cache" },
  ];
  return (
    <BrowserChrome title="next-cache-inspector — Fetches">
      <div className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#333] text-gray-400">
              <th className="pb-2 font-medium">Method</th>
              <th className="pb-2 font-medium">Path</th>
              <th className="pb-2 font-medium">Cache</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#333]">
                <td className="py-2 font-mono text-blue-400">{r.method}</td>
                <td className="py-2 font-mono text-gray-300">{r.path}</td>
                <td className="py-2">
                  <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                    {r.cache}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BrowserChrome>
  );
}

function RulesView(): React.JSX.Element {
  const rules = [
    { label: "Fetch has cache strategy", pass: true },
    { label: "Revalidate time is set", pass: true },
    { label: "Tags are configured", pass: false },
    { label: "No conflicting headers", pass: true },
    { label: "Static paths detected", pass: true },
  ];
  return (
    <BrowserChrome title="next-cache-inspector — Rules">
      <div className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
        <div className="space-y-2">
          {rules.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-[#333] bg-[#222] px-3 py-2"
            >
              <span className="text-xs text-gray-300">{r.label}</span>
              {r.pass ? (
                <CheckCircle2 className="size-4 text-green-400" />
              ) : (
                <XCircle className="size-4 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </BrowserChrome>
  );
}

function TagsView(): React.JSX.Element {
  const tags = [
    "product-list", "user-profile", "cart", "blog-posts",
    "search-results", "homepage", "api-config", "session",
  ];
  return (
    <BrowserChrome title="next-cache-inspector — Tags">
      <div className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#333] bg-[#222] px-3 py-1 text-xs font-medium text-gray-300"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-[#333] bg-[#222] p-3">
          <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Revalidation Log</div>
          <div className="mt-2 space-y-1">
            <div className="text-[10px] text-gray-400 font-mono">revalidateTag(&quot;product-list&quot;) — 2s ago</div>
            <div className="text-[10px] text-gray-400 font-mono">revalidatePath(&quot;/blog&quot;) — 5m ago</div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}

function ScanView(): React.JSX.Element {
  return (
    <BrowserChrome title="next-cache-inspector — Scan">
      <div className="flex-1 overflow-auto bg-[#0f0f0f] p-4">
        <div className="font-mono text-[10px] leading-relaxed text-gray-300">
          <span className="text-green-400">$</span> next-cache-inspector scan<br />
          <span className="text-gray-500">→ Scanning src/app...</span><br />
          <span className="text-gray-500">→ Found 14 route segments</span><br />
          <span className="text-gray-500">→ Found 8 fetch calls</span><br />
          <span className="text-green-400">✓</span> <span className="text-gray-300">/page.tsx</span> <span className="text-yellow-400">static</span><br />
          <span className="text-green-400">✓</span> <span className="text-gray-300">/blog/page.tsx</span> <span className="text-yellow-400">ISR 60s</span><br />
          <span className="text-yellow-400">⚠</span> <span className="text-gray-300">/shop/page.tsx</span> <span className="text-red-400">no cache</span><br />
          <span className="text-green-400">✓</span> <span className="text-gray-300">/api/products/route.ts</span> <span className="text-yellow-400">force-cache</span><br />
          <span className="text-gray-500">→ Report generated in 1.2s</span><br />
        </div>
      </div>
    </BrowserChrome>
  );
}

function TabPreview({ activeTab }: { activeTab: string }): React.JSX.Element {
  const views: Record<string, React.JSX.Element> = {
    topology: <TopologyView />,
    fetches: <FetchesView />,
    rules: <RulesView />,
    tags: <TagsView />,
    scan: <ScanView />,
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="relative overflow-hidden rounded-sm bg-[#1a1a1a]">
        <div className="relative px-3 pb-1 pt-8 sm:px-5 md:px-7">
          <div className="relative">
            {views[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Full-width grid background on dark */
function GridBackground(): React.JSX.Element {
  const cellClass = "bg-[#111] border border-[#333] rounded-sm";

  return (
    <div className="absolute inset-0 flex flex-col bg-[#111]">
      {/* Top row */}
      <div className="grid grid-cols-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`aspect-square ${cellClass}`} />
        ))}
      </div>

      {/* Middle - side frames + center gap */}
      <div className="grid flex-1 grid-cols-10">
        {/* Left frame */}
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex-1 ${cellClass}`} />
          ))}
        </div>

        {/* Center gap (content area) */}
        <div className="col-span-8" />

        {/* Right frame */}
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex-1 ${cellClass}`} />
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`aspect-square ${cellClass}`} />
        ))}
      </div>
    </div>
  );
}

export default function HeroSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("topology");

  return (
    <section className="relative overflow-hidden bg-[#111] pt-24">
      <GridBackground />

      <Navbar />

      {/* Content - centered */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-8 text-center md:pt-12">
        {/* Headline */}
        <h1 className="flex flex-col items-center gap-1 text-balance font-medium text-2xl text-white sm:text-4xl md:text-5xl">
          <span className="inline-flex items-center justify-center gap-x-2">
            Inspect your
            <span
              aria-hidden="true"
              className="relative mx-0.5 inline-flex size-7 rotate-6 items-center justify-center rounded-md bg-[#1a1a1a] shadow-sm ring-1 ring-white/10 sm:mx-2 sm:size-12 sm:rounded-lg"
            >
              <RotatingTechBadge />
            </span>
            App Router
          </span>
          <span>
            <span className="font-medium text-[#FFC000] underline decoration-[#FFC000]/50 decoration-dashed">
              cache
            </span>{" "}
            with confidence
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="mx-auto mt-5 mb-9 max-w-3xl text-balance font-normal text-base text-gray-400 sm:mt-7 sm:text-lg">
          Track and optimize your Next.js App Router caching strategy with
          static analysis to build faster applications.
        </h2>

        {/* CTAs */}
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/topology"
            className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-md focus-visible:ring-1 focus-visible:ring-gray-500 active:scale-[0.99] active:transition-none h-9 py-2 text-base border border-[#333] shadow-sm ring-1 ring-white/10 duration-200 hover:bg-[#252525] w-full bg-[#1a1a1a] text-white px-5 sm:w-auto"
          >
            View Demo
          </Link>
          <Link
            href="/topology"
            className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-md duration-150 focus-visible:ring-1 focus-visible:ring-gray-500 active:scale-[0.99] active:transition-none h-9 py-2 text-base border-[0.5px] border-white/25 bg-[#FFC000] text-zinc-950 ring-1 hover:bg-[#E6AC00] flex w-full gap-2 px-5 sm:w-auto"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Social proof */}
        <div className="items-center gap-3 rounded-full text-sm mt-3 hidden sm:mt-7 sm:inline-flex">
          <Github className="size-5 text-gray-400" />
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-2.5 fill-[#FFC000] text-[#FFC000]"
                />
              ))}
            </div>
            <span className="font-medium text-[10px] text-gray-400">
              Open source dev tool
            </span>
          </div>
        </div>

        {/* Interactive tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-[#333] bg-[#252525] text-white shadow-sm"
                    : "border-[#333] bg-[#1a1a1a] text-gray-300 hover:border-[#444] hover:bg-[#252525]"
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab preview */}
        <div className="relative mt-8 sm:mt-10">
          <TabPreview activeTab={activeTab} />
        </div>
      </div>

      <ContributorsCarousel />
    </section>
  );
}
