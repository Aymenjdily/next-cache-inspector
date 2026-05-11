"use client";

import Link from "next/link";
import { Radar } from "lucide-react";

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-[#333] bg-[#111]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-[#FFC000]" strokeWidth={1.5} />
          <span className="text-xs font-medium text-gray-400">
            next-cache-inspector
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <a
            href="https://www.npmjs.com/package/next-cache-inspector"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-300"
          >
            npm
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-300"
          >
            GitHub
          </a>
          <span>MIT License</span>
          <span className="text-gray-600">·</span>
          <a
            href="https://aymenjdily.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-300"
          >
            Built by Aymen Jdily
          </a>
        </div>
      </div>
    </footer>
  );
}
