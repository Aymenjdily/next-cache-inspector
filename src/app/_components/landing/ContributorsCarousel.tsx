"use client";

import { useState, useEffect, useRef } from "react";

interface Contributor {
  username: string;
  name: string;
}

const allContributors: Contributor[] = [
  { username: "alice-dev", name: "Alice" },
  { username: "bob-codes", name: "Bob" },
  { username: "charlie-js", name: "Charlie" },
  { username: "dana-dev", name: "Dana" },
  { username: "evan-oss", name: "Evan" },
  { username: "frank-ts", name: "Frank" },
  { username: "grace-rx", name: "Grace" },
  { username: "henry-go", name: "Henry" },
  { username: "iris-vue", name: "Iris" },
  { username: "jack-rust", name: "Jack" },
];

const CYCLE_MS = 3000;
const TRANSITION_MS = 500;

function ContributorCell({
  contributor,
  index,
}: {
  contributor: Contributor;
  index: number;
}): React.JSX.Element {
  const [current, setCurrent] = useState(contributor);
  const [isSwapping, setIsSwapping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (contributor.username === current.username) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsSwapping(true);

    timeoutRef.current = setTimeout(() => {
      setCurrent(contributor);
      setIsSwapping(false);
    }, TRANSITION_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [contributor, current.username]);

  const src = `https://ui-avatars.com/api/?name=${encodeURIComponent(current.name)}&background=333&color=fff&size=128`;

  return (
    <a
      href={`https://github.com/${current.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center border-[#333] bg-[#111] py-8 transition-colors hover:bg-[#1a1a1a] sm:py-10 ${
        index !== 0 ? "border-l" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <img
          src={src}
          alt={current.username}
          className="size-8 rounded-full transition-all duration-500 ease-out sm:size-10"
          style={{
            opacity: isSwapping ? 0 : 1,
            transform: isSwapping ? "translateY(-8px) scale(0.85)" : "translateY(0) scale(1)",
            filter: isSwapping ? "blur(4px)" : "blur(0px)",
          }}
        />
        <span
          className="text-xs font-medium text-gray-400 transition-all duration-500 ease-out sm:text-sm"
          style={{
            opacity: isSwapping ? 0 : 1,
            transform: isSwapping ? "translateY(4px)" : "translateY(0)",
          }}
        >
          {current.name}
        </span>
      </div>
    </a>
  );
}

export default function ContributorsCarousel(): React.JSX.Element {
  const [indices, setIndices] = useState(() =>
    Array.from({ length: 5 }, (_, i) => i)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        let pick = next[i];
        while (pick === next[i] && allContributors.length > 1) {
          pick = Math.floor(Math.random() * allContributors.length);
        }
        next[i] = pick;
        return next;
      });
    }, CYCLE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative border-y border-[#333] bg-[#111]">
      <div className="mx-auto max-w-5xl px-6 py-10 text-center sm:py-14">
        <p className="text-sm font-medium text-gray-400">
          Trusted by developers and teams building with Next.js
        </p>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-5">
          {indices.map((contributorIndex, i) => (
            <ContributorCell
              key={i}
              index={i}
              contributor={allContributors[contributorIndex]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
