"use client";

import { useEffect } from "react";

import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph } from "@/types";

export default function GraphHydrator({
  initialGraph,
}: Readonly<{
  initialGraph: CacheGraph | null;
}>): React.JSX.Element | null {
  const setGraph = useInspectorStore((state) => state.setGraph);

  useEffect((): void => {
    setGraph(initialGraph);
  }, [initialGraph, setGraph]);

  return null;
}
