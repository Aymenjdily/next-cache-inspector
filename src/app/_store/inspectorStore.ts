"use client";

import { create } from "zustand";

import type { CacheGraph } from "@/types";

export type HighlightMode = "none" | "tag" | "route" | "revalidator";
export type AntiPatternFilter = "all" | "warning" | "error";
export type InspectorView = "topology" | "tags" | "fetches" | "flow" | "rules";

export interface InspectorState {
  graph: CacheGraph | null;
  isLoading: boolean;
  selectedRouteId: string | null;
  selectedTagName: string | null;
  selectedRevalidatorId: string | null;
  highlightMode: HighlightMode;
  antiPatternFilter: AntiPatternFilter;
  view: InspectorView;
  setGraph: (graph: CacheGraph | null) => void;
  selectRoute: (id: string | null) => void;
  selectTag: (name: string | null) => void;
  selectRevalidator: (id: string | null) => void;
  setHighlightMode: (mode: HighlightMode) => void;
  setAntiPatternFilter: (filter: AntiPatternFilter) => void;
  setView: (view: InspectorView) => void;
}

const inspectorStore = create<InspectorState>((set) => ({
  graph: null,
  isLoading: false,
  selectedRouteId: null,
  selectedTagName: null,
  selectedRevalidatorId: null,
  highlightMode: "none",
  antiPatternFilter: "all",
  view: "topology",
  setGraph: (graph: CacheGraph | null): void =>
    set(() => ({
      graph,
      isLoading: false,
      selectedRouteId: graph ? null : null,
      selectedTagName: graph ? null : null,
      selectedRevalidatorId: graph ? null : null,
    })),
  selectRoute: (id: string | null): void =>
    set(() => ({
      selectedRouteId: id,
      selectedTagName: null,
      selectedRevalidatorId: null,
    })),
  selectTag: (name: string | null): void =>
    set(() => ({
      selectedRouteId: null,
      selectedTagName: name,
      selectedRevalidatorId: null,
    })),
  selectRevalidator: (id: string | null): void =>
    set(() => ({
      selectedRouteId: null,
      selectedTagName: null,
      selectedRevalidatorId: id,
    })),
  setHighlightMode: (mode: HighlightMode): void =>
    set(() => ({
      highlightMode: mode,
    })),
  setAntiPatternFilter: (filter: AntiPatternFilter): void =>
    set(() => ({
      antiPatternFilter: filter,
    })),
  setView: (view: InspectorView): void =>
    set(() => ({
      view,
    })),
}));

export function useInspectorStore<T>(selector: (state: InspectorState) => T): T {
  return inspectorStore(selector);
}
