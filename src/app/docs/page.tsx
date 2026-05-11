import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Zap,
  AlertTriangle,
  Search,
  Tag,
  GitBranch,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/app/_components/landing/Navbar";
import Footer from "@/app/_components/landing/Footer";

interface DocSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function DocSection({ icon: Icon, title, description }: DocSectionProps): React.JSX.Element {
  return (
    <div className="flex gap-4 rounded-lg border border-[#333] bg-[#111] p-5 transition-colors hover:bg-[#1a1a1a]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#FFC000]/10">
        <Icon className="h-5 w-5 text-[#FFC000]" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="mt-1 text-[13px] text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default function DocsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#111] text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFC000]/30 bg-[#FFC000]/10 px-4 py-1.5 text-[13px] text-[#FFC000]">
            <BookOpen className="h-4 w-4" />
            Documentation
          </div>
          <h1 className="text-3xl font-bold text-white">How to use next-cache-inspector</h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-gray-400">
            Learn how to scan, analyze, and optimize your Next.js App Router caching strategy.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-medium text-white">Quick Start</h2>
          <div className="rounded-lg border border-[#333] bg-[#0a0a0a] p-5">
            <div className="mb-3 flex items-center gap-2 text-[13px] text-gray-400">
              <Terminal className="h-4 w-4" />
              Install and run
            </div>
            <pre className="overflow-x-auto rounded-md bg-[#111] p-4 font-mono text-[13px] text-gray-300">
              <code>{`npx next-cache-inspector --dir ./my-app
# or
npm install -g next-cache-inspector
next-cache-inspector --dir ./my-app`}</code>
            </pre>
            <p className="mt-3 text-[13px] text-gray-500">
              The dashboard will open at{" "}
              <code className="rounded bg-[#111] px-1.5 py-0.5 text-[12px] text-gray-400">
                http://localhost:4242
              </code>
            </p>
          </div>
        </section>

        {/* Views */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-medium text-white">Inspector Views</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DocSection
              icon={Zap}
              title="Dashboard"
              description="Get a high-level overview of your project with key metrics, route type distribution, and recent activity."
            />
            <DocSection
              icon={Search}
              title="Topology"
              description="Visualize your app directory structure as an interactive graph. See how routes and layouts connect."
            />
            <DocSection
              icon={Tag}
              title="Tags"
              description="Browse all cache tags used across your application. See which routes use each tag and how they're invalidated."
            />
            <DocSection
              icon={GitBranch}
              title="Flow"
              description="Understand the data flow between revalidators, tags, and routes. Spot invalidation chains at a glance."
            />
            <DocSection
              icon={Zap}
              title="Fetches"
              description="Review every fetch() call in your application with cache settings, revalidation periods, and tags."
            />
            <DocSection
              icon={ShieldAlert}
              title="Rules"
              description="Catch caching anti-patterns and misconfigurations before they cause issues in production."
            />
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-medium text-white">Best Practices</h2>
          <div className="space-y-4">
            {[
              {
                title: "Use cache tags consistently",
                body: "Tag your fetch calls so you can revalidate them precisely instead of purging entire route caches.",
              },
              {
                title: "Set appropriate revalidate values",
                body: "ISR routes should have a sensible revalidate period. Avoid mixing static and dynamic on the same route without understanding the implications.",
              },
              {
                title: "Review anti-patterns regularly",
                body: "The Rules view highlights potential issues. Address warnings early to prevent cache-related bugs.",
              },
              {
                title: "Monitor fetch cache settings",
                body: "Explicitly set cache and revalidate in fetch calls. Relying on defaults can lead to unexpected behavior across Next.js versions.",
              },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-3 rounded-lg border border-[#333] bg-[#111] p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC000]" />
                <div>
                  <h3 className="text-[13px] font-medium text-white">{tip.title}</h3>
                  <p className="mt-1 text-[13px] text-gray-400">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFC000] px-6 py-3 text-sm font-medium text-[#111] transition-colors hover:bg-[#e6ac00]"
          >
            Go to Landing Page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
