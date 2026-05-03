"use client";

import Link from "next/link";
import { Radar } from "lucide-react";

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-zinc-800/50">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-[#FFC000]" strokeWidth={1.5} />
          <span className="text-xs font-medium text-zinc-400">
            next-cache-inspector
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <a
            href="https://www.npmjs.com/package/next-cache-inspector"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-300"
          >
            npm
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-300"
          >
            GitHub
          </a>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
