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

/* Preview mock sidebar items */
const sidebarItems = [
  { icon: "◆", label: "Dashboard", active: false },
  { icon: "◎", label: "Topology", active: true },
  { icon: "▣", label: "Tags", active: false },
  { icon: "▼", label: "Fetches", active: false },
  { icon: "◈", label: "Flow", active: false },
  { icon: "◊", label: "Rules", active: false },
];

function MockSidebar(): React.JSX.Element {
  return (
    <div className="hidden w-[140px] flex-col border-r border-[#333] bg-[#111] p-2 md:flex">
      <div className="mb-3 flex items-center gap-2 px-2 py-1.5">
        <div className="size-6 rounded bg-[#FFC000]" />
        <div className="h-2 w-16 rounded bg-gray-700" />
      </div>
      {sidebarItems.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-[10px] ${
            item.active
              ? "border-l-2 border-[#FFC000] bg-[#1a1a1a] text-white"
              : "text-gray-500"
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <div className="mt-auto space-y-1 px-2 py-2">
        <div className="h-1.5 w-full rounded bg-gray-800" />
        <div className="h-1.5 w-2/3 rounded bg-gray-800" />
      </div>
    </div>
  );
}

function PreviewWindow({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#333] bg-[#111] shadow-2xl shadow-black/50">
      {/* Browser Chrome */}
      <div className="flex h-8 shrink-0 items-center border-b border-[#333] bg-[#161616] px-3">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#ff5f57]" />
          <div className="size-2.5 rounded-full bg-[#febc2e]" />
          <div className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex max-w-[200px] flex-1 items-center justify-center rounded-md bg-[#0a0a0a] px-3 py-0.5">
          <span className="text-[10px] text-gray-500">{title}</span>
        </div>
        <div className="w-[42px]" />
      </div>
      
      {/* App Layout */}
      <div className="flex flex-1 overflow-hidden">
        <MockSidebar />
        <div className="flex-1 overflow-auto bg-[#111]">
          {children}
        </div>
      </div>
    </div>
  );
}

function TopologyPreview(): React.JSX.Element {
  return (
    <PreviewWindow title="localhost:4242/topology">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-gray-800" />
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded bg-[#1a1a1a]" />
            <div className="h-6 w-6 rounded bg-[#1a1a1a]" />
          </div>
        </div>
        <svg viewBox="0 0 400 220" className="w-full" aria-hidden="true">
          {/* Root */}
          <rect x="170" y="10" width="60" height="28" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <text x="200" y="28" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="monospace">layout</text>
          
          {/* Level 1 */}
          <rect x="60" y="80" width="70" height="28" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <text x="95" y="98" textAnchor="middle" fill="#aaa" fontSize="10" fontFamily="monospace">/ (home)</text>
          
          <rect x="165" y="80" width="70" height="28" rx="6" fill="#1a1a1a" stroke="#FFC000" strokeWidth="1.5" />
          <text x="200" y="98" textAnchor="middle" fill="#FFC000" fontSize="10" fontFamily="monospace">/blog</text>
          
          <rect x="270" y="80" width="70" height="28" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <text x="305" y="98" textAnchor="middle" fill="#aaa" fontSize="10" fontFamily="monospace">/shop</text>
          
          {/* Level 2 */}
          <rect x="50" y="150" width="60" height="24" rx="6" fill="#0f2818" stroke="#10b981" strokeWidth="1" />
          <text x="80" y="166" textAnchor="middle" fill="#10b981" fontSize="9">static</text>
          
          <rect x="150" y="150" width="60" height="24" rx="6" fill="#2a1a00" stroke="#FFC000" strokeWidth="1" />
          <text x="180" y="166" textAnchor="middle" fill="#FFC000" fontSize="9">ISR 60s</text>
          
          <rect x="260" y="150" width="60" height="24" rx="6" fill="#1a0a2a" stroke="#a855f7" strokeWidth="1" />
          <text x="290" y="166" textAnchor="middle" fill="#a855f7" fontSize="9">dynamic</text>
          
          {/* Connections */}
          <line x1="200" y1="38" x2="95" y2="80" stroke="#444" strokeWidth="1" />
          <line x1="200" y1="38" x2="200" y2="80" stroke="#444" strokeWidth="1.5" />
          <line x1="200" y1="38" x2="305" y2="80" stroke="#444" strokeWidth="1" />
          
          <line x1="95" y1="108" x2="80" y2="150" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="200" y1="108" x2="180" y2="150" stroke="#FFC000" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="305" y1="108" x2="290" y2="150" stroke="#333" strokeWidth="1" strokeDasharray="3,3" />
          
          {/* Tag badge */}
          <rect x="140" y="190" width="120" height="20" rx="10" fill="#1a1500" stroke="#FFC000" strokeWidth="1" opacity="0.8" />
          <text x="200" y="203" textAnchor="middle" fill="#FFC000" fontSize="9">tag: product-list</text>
        </svg>
      </div>
    </PreviewWindow>
  );
}

function FetchesPreview(): React.JSX.Element {
  return (
    <PreviewWindow title="localhost:4242/fetches">
      <div className="p-4">
        <div className="mb-4 h-8 w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2">
          <div className="h-3 w-3 rounded-full bg-gray-700" />
        </div>
        <div className="space-y-2">
          {[
            { method: "GET", path: "/api/products", cache: "force-cache", color: "#10b981" },
            { method: "POST", path: "/api/cart", cache: "no-store", color: "#ef4444" },
            { method: "GET", path: "/api/user", cache: "revalidate 300", color: "#f59e0b" },
            { method: "GET", path: "/api/search", cache: "force-cache", color: "#10b981" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2.5">
              <span className="w-10 text-[10px] font-mono" style={{ color: r.method === "GET" ? "#3b82f6" : "#a855f7" }}>
                {r.method}
              </span>
              <span className="flex-1 text-[11px] text-gray-300 font-mono">{r.path}</span>
              <span 
                className="rounded-md px-2 py-0.5 text-[9px] font-medium"
                style={{ backgroundColor: `${r.color}20`, color: r.color }}
              >
                {r.cache}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PreviewWindow>
  );
}

function RulesPreview(): React.JSX.Element {
  return (
    <PreviewWindow title="localhost:4242/rules">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-16 rounded bg-[#1a1a1a] border border-[#333]" />
          <div className="h-5 w-16 rounded bg-[#1a1a1a] border border-[#FFC000]" />
        </div>
        <div className="space-y-2">
          {[
            { label: "Static route with ISR config", pass: true },
            { label: "Fetch missing cache strategy", pass: false },
            { label: "Revalidate time is optimal", pass: true },
            { label: "Tags properly configured", pass: true },
            { label: "No cache conflicts detected", pass: true },
          ].map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                r.pass
                  ? "border-[#333] bg-[#1a1a1a]"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              {r.pass ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="size-4 shrink-0 text-red-500" />
              )}
              <span className="flex-1 text-[11px] text-gray-300">{r.label}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.pass ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                {r.pass ? "PASS" : "FAIL"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PreviewWindow>
  );
}

function TagsPreview(): React.JSX.Element {
  return (
    <PreviewWindow title="localhost:4242/tags">
      <div className="p-4">
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[
            { label: "Routes", value: "14", color: "#10b981" },
            { label: "Tags", value: "8", color: "#3b82f6" },
            { label: "Fetches", value: "6", color: "#f59e0b" },
            { label: "Issues", value: "1", color: "#ef4444" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#333] bg-[#1a1a1a] p-2.5">
              <div className="text-sm font-semibold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {[
            "product-list", "user-profile", "cart", "blog-posts",
            "search-results", "homepage", "api-config", "session",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#333] bg-[#1a1a1a] px-2.5 py-1 text-[10px] text-gray-300 hover:border-[#FFC000] hover:text-[#FFC000] transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="rounded-lg border border-[#333] bg-[#1a1a1a] p-3">
          <div className="mb-2 text-[9px] font-medium uppercase tracking-wider text-gray-500">Recent Revalidations</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono text-[#FFC000]">revalidateTag(&quot;product-list&quot;)</span>
              <span className="text-gray-600">2s ago</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono text-gray-400">revalidatePath(&quot;/blog&quot;)</span>
              <span className="text-gray-600">5m ago</span>
            </div>
          </div>
        </div>
      </div>
    </PreviewWindow>
  );
}

function ScanPreview(): React.JSX.Element {
  return (
    <PreviewWindow title="Terminal">
      <div className="flex-1 bg-[#0a0a0a] p-4 font-mono">
        <div className="space-y-1 text-[10px] leading-relaxed">
          <div className="flex items-center gap-2">
            <span className="text-green-500">➜</span>
            <span className="text-blue-400">~</span>
            <span className="text-gray-500">next-cache-inspector --dir .</span>
          </div>
          <div className="mt-2 space-y-0.5 text-gray-400">
            <div>Scanning <span className="text-white">src/app</span>...</div>
            <div>Found <span className="text-[#FFC000]">14</span> route segments</div>
            <div>Found <span className="text-[#FFC000]">8</span> fetch calls</div>
            <div>Found <span className="text-[#FFC000]">3</span> cache tags</div>
          </div>
          <div className="mt-2 space-y-0.5">
            <div><span className="text-emerald-500">✓</span> <span className="text-gray-300">/page.tsx</span> <span className="rounded bg-emerald-500/10 px-1 text-[9px] text-emerald-400">static</span></div>
            <div><span className="text-emerald-500">✓</span> <span className="text-gray-300">/blog/page.tsx</span> <span className="rounded bg-amber-500/10 px-1 text-[9px] text-amber-400">ISR 60s</span></div>
            <div><span className="text-yellow-500">⚠</span> <span className="text-gray-300">/shop/page.tsx</span> <span className="rounded bg-red-500/10 px-1 text-[9px] text-red-400">no cache</span></div>
            <div><span className="text-emerald-500">✓</span> <span className="text-gray-300">/api/products/route.ts</span> <span className="rounded bg-emerald-500/10 px-1 text-[9px] text-emerald-400">force-cache</span></div>
          </div>
          <div className="mt-2 text-gray-500">Report generated in <span className="text-[#FFC000]">1.2s</span></div>
          <div className="mt-1 animate-pulse text-gray-600">_</div>
        </div>
      </div>
    </PreviewWindow>
  );
}

function TabPreview({ activeTab }: { activeTab: string }): React.JSX.Element {
  const views: Record<string, React.JSX.Element> = {
    topology: <TopologyPreview />,
    fetches: <FetchesPreview />,
    rules: <RulesPreview />,
    tags: <TagsPreview />,
    scan: <ScanPreview />,
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#FFC000]/5 to-transparent p-1">
        <div className="relative rounded-xl bg-[#0a0a0a] p-2 shadow-2xl">
          {views[activeTab]}
        </div>
      </div>
    </div>
  );
}

/* Animated mesh gradient background */
function MeshBackground(): React.JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Base gradient */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 192, 0, 0.15), transparent)',
        }}
      />
      
      {/* Animated floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFC000]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 192, 0, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 192, 0, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Diagonal lines */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255, 192, 0, 0.3) 35px, rgba(255, 192, 0, 0.3) 36px)',
        }}
      />
      
      {/* Bottom fade to content */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

/* Animated particles */
function FloatingParticles(): React.JSX.Element {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#FFC000]/20 animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("topology");

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] pt-24">
      <MeshBackground />
      <FloatingParticles />

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
