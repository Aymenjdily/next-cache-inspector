"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import TagCard, { TagToastList, type TagCardToast } from "@/app/_components/TagCard";
import { useInspectorStore } from "@/app/_store/inspectorStore";

export default function TagsViewClient(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);
  const [search, setSearch] = useState<string>("");
  const [toasts, setToasts] = useState<TagCardToast[]>([]);

  useEffect((): (() => void) => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        setToasts((currentValue) => currentValue.filter((item) => item.id !== toast.id));
      }, 2200),
    );
    return (): void => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  const filteredTags = useMemo(() => {
    if (!graph) return [];
    const query = search.trim().toLowerCase();
    return graph.tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [graph, search]);

  if (!graph) return null;

  return (
    <>
      <TagToastList toasts={toasts} />

      <section className="space-y-6">
        <div className="rounded-lg border border-[#333] bg-[#111] p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <input
              type="search"
              value={search}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                setSearch(event.target.value);
              }}
              placeholder="Search tags"
              className="w-full rounded-md border border-[#333] bg-[#0a0a0a] px-3 py-1.5 pl-9 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#FFC000]"
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.name}
              tag={tag}
              linkedRoutes={graph.routes.filter((route) => tag.usedBy.includes(route.id))}
              linkedRevalidators={graph.revalidators.filter((revalidator) => tag.invalidatedBy.includes(revalidator.id))}
              onToast={(toast: TagCardToast): void => {
                setToasts((currentValue) => [...currentValue, toast]);
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
