"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Network,
  Search,
  ShieldCheck,
  Tag,
  ScanLine,
  LayoutDashboard,
  RefreshCw,
  Terminal,
  Plug,
  Settings,
} from "lucide-react";

interface DropdownItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  {
    label: "Features",
    href: "#features",
    dropdown: [
      {
        icon: <Network className="h-5 w-5 text-[#FFC000]" />,
        label: "Cache Topology",
        description: "Visualize your app router cache graph",
        href: "/topology",
      },
      {
        icon: <Search className="h-5 w-5 text-[#FFC000]" />,
        label: "Fetch Analysis",
        description: "Inspect fetch cache strategies",
        href: "/fetches",
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-[#FFC000]" />,
        label: "Rules Engine",
        description: "Validate caching best practices",
        href: "/rules",
      },
      {
        icon: <Tag className="h-5 w-5 text-[#FFC000]" />,
        label: "Tag System",
        description: "Track cache tags and revalidation",
        href: "/tags",
      },
    ],
  },
  {
    label: "How it works",
    href: "#how-it-works",
    dropdown: [
      {
        icon: <ScanLine className="h-5 w-5 text-[#FFC000]" />,
        label: "Static Analysis",
        description: "Scan your codebase without instrumentation",
        href: "#how-it-works",
      },
      {
        icon: <LayoutDashboard className="h-5 w-5 text-[#FFC000]" />,
        label: "Visual Dashboard",
        description: "Explore results in an interactive UI",
        href: "#how-it-works",
      },
      {
        icon: <RefreshCw className="h-5 w-5 text-[#FFC000]" />,
        label: "Real-time Updates",
        description: "Live reload as your code changes",
        href: "#how-it-works",
      },
    ],
  },
  {
    label: "Install",
    href: "#install",
    dropdown: [
      {
        icon: <Terminal className="h-5 w-5 text-[#FFC000]" />,
        label: "CLI Install",
        description: "Global npm package installation",
        href: "#install",
      },
      {
        icon: <Plug className="h-5 w-5 text-[#FFC000]" />,
        label: "Next.js Integration",
        description: "Drop-in route for your app",
        href: "#install",
      },
      {
        icon: <Settings className="h-5 w-5 text-[#FFC000]" />,
        label: "Configuration",
        description: "Customize analysis options",
        href: "#install",
      },
    ],
  },
];

function DropdownPanel({
  items,
  isOpen,
}: {
  items: DropdownItem[];
  isOpen: boolean;
}): React.JSX.Element | null {
  if (!isOpen) return null;
  return (
    <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 pt-2">
      <div className="overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] shadow-xl shadow-black/50">
        <div className="p-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#252525]"
            >
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar(): React.JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnter = useCallback((label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }, []);

  return (
    <header 
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "border-b border-[#333]/50 bg-[#0a0a0a]/80 backdrop-blur-md shadow-sm shadow-black/20" 
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="next-cache-inspector"
            className="h-8 w-8 shrink-0 rounded-md"
          />
          <span className="text-base font-semibold tracking-tight text-white">
            next-cache-inspector
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.dropdown && handleEnter(item.label)}
              onMouseLeave={handleLeave}
            >
              <a
                href={item.href}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-4 w-4" />}
              </a>
              {item.dropdown && (
                <DropdownPanel
                  items={item.dropdown}
                  isOpen={openDropdown === item.label}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/docs"
            className="inline-flex h-9 items-center rounded-lg border border-[#333] bg-[#1a1a1a] px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-[#252525]"
          >
            View Docs
          </Link>
          <Link
            href="/topology"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FFC000] px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-[#E6AC00]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-400 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#333]/30 bg-[#0a0a0a]/95 backdrop-blur-md px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                  onClick={() => {
                    if (!item.dropdown) setMobileOpen(false);
                  }}
                >
                  {item.label}
                  {item.dropdown && <ChevronDown className="h-4 w-4" />}
                </a>
                {item.dropdown && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[#333] pl-3">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-[#1a1a1a]"
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className="mt-0.5 shrink-0">{sub.icon}</div>
                        <div>
                          <p className="font-medium text-white">{sub.label}</p>
                          <p className="text-xs text-gray-400">{sub.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/docs"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#333] bg-[#1a1a1a] text-sm font-medium text-gray-300 hover:bg-[#252525]"
              >
                View Docs
              </Link>
              <Link
                href="/topology"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#FFC000] text-sm font-medium text-zinc-950 hover:bg-[#E6AC00]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
