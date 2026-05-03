"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ThemeIcon = mounted && resolvedTheme === "dark" ? Sun : Moon;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="next-cache-inspector"
            className="h-8 w-8 shrink-0 rounded-md"
          />
          <span className="text-sm font-semibold tracking-wide text-zinc-100">
            next-cache-inspector
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-[13px] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[13px] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            How it works
          </a>
          <a
            href="#install"
            className="text-[13px] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Install
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(): void => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label={mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={mounted && resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>

          <Link
            href="/topology"
            className="inline-flex h-8 items-center gap-2 rounded-md bg-[#FFC000] px-3 text-[13px] font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00]"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
