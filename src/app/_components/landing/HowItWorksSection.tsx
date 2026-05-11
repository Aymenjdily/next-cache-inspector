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
    <section id="how-it-works" className="border-t border-[#333] bg-[#111]">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
            From zero to insight in three steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-[#333] md:left-1/2 md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={step.number}
                  className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Number circle */}
                  <div className="absolute left-8 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-[#333] bg-[#111] text-xs font-bold text-gray-400 md:flex">
                    {step.number}
                  </div>

                  {/* Text content */}
                  <div className={`flex-1 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                    <span className="font-mono text-lg font-bold text-[#333] md:hidden">
                      {step.number}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-white md:mt-0">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {step.description}
                    </p>
                  </div>

                  {/* Code block */}
                  <div className={`flex-1 ${isEven ? "md:pl-16" : "md:pr-16"}`}>
                    <div className="rounded-lg border border-[#333] bg-[#111] p-1">
                      <div className="rounded-md bg-[#0a0a0a] px-4 py-3">
                        <code className="font-mono text-sm text-gray-300">
                          {step.command}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
