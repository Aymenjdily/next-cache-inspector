"use client";

export default function DashboardMockup(): React.JSX.Element {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
      {/* Fake top bar */}
      <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="h-2 w-2 rounded-full bg-zinc-700" />
        <div className="ml-4 h-2 w-24 rounded bg-zinc-800" />
      </div>

      {/* Fake sidebar + canvas */}
      <div className="flex gap-4">
        {/* Fake sidebar */}
        <div className="hidden w-16 flex-col gap-3 sm:flex">
          <div className="mx-auto h-6 w-6 rounded bg-zinc-800" />
          <div className="mx-auto h-6 w-6 rounded bg-[#FFC000]/20" />
          <div className="mx-auto h-6 w-6 rounded bg-zinc-800" />
          <div className="mx-auto h-6 w-6 rounded bg-zinc-800" />
          <div className="mx-auto h-6 w-6 rounded bg-zinc-800" />
        </div>

        {/* Fake graph canvas */}
        <div className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 p-4">
          <svg viewBox="0 0 320 180" className="w-full" aria-hidden="true">
            {/* Route nodes */}
            <rect x="20" y="70" width="56" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="48" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/</text>

            <rect x="130" y="40" width="72" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="166" y="60" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/blog</text>

            <rect x="130" y="100" width="72" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="166" y="120" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/shop</text>

            <rect x="250" y="25" width="56" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="278" y="45" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/[id]</text>

            <rect x="250" y="70" width="56" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="278" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/cart</text>

            <rect x="250" y="115" width="56" height="32" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <text x="278" y="135" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">/[id]</text>

            {/* Edges */}
            <line x1="76" y1="86" x2="130" y2="56" stroke="#3f3f46" strokeWidth="1.5" />
            <line x1="76" y1="86" x2="130" y2="116" stroke="#3f3f46" strokeWidth="1.5" />
            <line x1="202" y1="56" x2="250" y2="41" stroke="#3f3f46" strokeWidth="1.5" />
            <line x1="202" y1="116" x2="250" y2="131" stroke="#3f3f46" strokeWidth="1.5" />

            {/* Tag badge */}
            <rect x="100" y="150" width="120" height="20" rx="4" fill="#FFC000/10" stroke="#FFC000/30" strokeWidth="1" />
            <text x="160" y="163" textAnchor="middle" fill="#FFC000" fontSize="9" fontFamily="monospace">tag: product-list</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
