"use client";

export default function DashboardMockup(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-t-xl border border-gray-200 border-b-0 bg-white shadow-2xl shadow-gray-200/50">
      {/* macOS-style top bar */}
      <div className="flex h-7 shrink-0 items-center border-b border-gray-200 bg-gray-100 px-3">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>
        <span className="flex-1 text-center text-[10px] font-medium text-gray-500">
          next-cache-inspector — Topology
        </span>
        <div className="w-[42px]" />
      </div>

      <div className="flex overflow-hidden md:flex-row">
        {/* Sidebar */}
        <div className="hidden w-16 flex-col gap-3 border-r border-gray-100 bg-gray-50/60 p-3 md:flex lg:w-[154px]">
          <div className="mx-auto h-6 w-6 rounded bg-gray-200 lg:mx-0 lg:h-5 lg:w-full" />
          <div className="mx-auto h-6 w-6 rounded bg-[#FFC000]/20 lg:mx-0 lg:h-5 lg:w-full" />
          <div className="mx-auto h-6 w-6 rounded bg-gray-200 lg:mx-0 lg:h-5 lg:w-full" />
          <div className="mx-auto h-6 w-6 rounded bg-gray-200 lg:mx-0 lg:h-5 lg:w-full" />
          <div className="mx-auto h-6 w-6 rounded bg-gray-200 lg:mx-0 lg:h-5 lg:w-full" />
        </div>

        {/* Graph canvas */}
        <div className="flex-1 bg-white p-4">
          <svg viewBox="0 0 320 180" className="w-full" aria-hidden="true">
            {/* Route nodes */}
            <rect
              x="20"
              y="70"
              width="56"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="48"
              y="90"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /
            </text>

            <rect
              x="130"
              y="40"
              width="72"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="166"
              y="60"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /blog
            </text>

            <rect
              x="130"
              y="100"
              width="72"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="166"
              y="120"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /shop
            </text>

            <rect
              x="250"
              y="25"
              width="56"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="278"
              y="45"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /[id]
            </text>

            <rect
              x="250"
              y="70"
              width="56"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="278"
              y="90"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /cart
            </text>

            <rect
              x="250"
              y="115"
              width="56"
              height="32"
              rx="4"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x="278"
              y="135"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="monospace"
            >
              /[id]
            </text>

            {/* Edges */}
            <line
              x1="76"
              y1="86"
              x2="130"
              y2="56"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            <line
              x1="76"
              y1="86"
              x2="130"
              y2="116"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            <line
              x1="202"
              y1="56"
              x2="250"
              y2="41"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />
            <line
              x1="202"
              y1="116"
              x2="250"
              y2="131"
              stroke="#9ca3af"
              strokeWidth="1.5"
            />

            {/* Tag badge */}
            <rect
              x="100"
              y="150"
              width="120"
              height="20"
              rx="4"
              fill="#FFF8E1"
              stroke="#FFC000"
              strokeWidth="1"
              opacity="0.7"
            />
            <text
              x="160"
              y="163"
              textAnchor="middle"
              fill="#B38600"
              fontSize="9"
              fontFamily="monospace"
            >
              tag: product-list
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
