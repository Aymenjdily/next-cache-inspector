"use client";

export default function HowItWorksSection(): React.JSX.Element {
  const steps = [
    {
      number: "01",
      title: "Point to your app",
      description:
        "Run the CLI with the path to your Next.js project. The engine scans your app/ directory automatically.",
      command: "next-cache-inspector --dir ./my-app",
    },
    {
      number: "02",
      title: "Dashboard opens",
      description:
        "A local server starts with your cache graph loaded. No configuration files needed.",
      command: "http://localhost:4242",
    },
    {
      number: "03",
      title: "Explore and fix",
      description:
        "Navigate topology, tags, fetches, flow, and rules. Click any route to open it in VS Code.",
      command: "vscode://file/...",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            How it works
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            From zero to insight in three steps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <span className="font-mono text-3xl font-bold text-zinc-800">
                {step.number}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-zinc-100">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                {step.description}
              </p>
              <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                <code className="font-mono text-[12px] text-zinc-300">
                  {step.command}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
