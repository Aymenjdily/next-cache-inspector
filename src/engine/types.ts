import type { AntiPattern, FetchCall, Revalidator, RouteNode } from "@/types";

export type RouteModuleKind = "page" | "layout" | "route" | "loading" | "error";

export interface ParsedRouteModule {
  id: string;
  kind: RouteModuleKind;
  sourceFile: string;
  path: string;
  type: RouteNode["type"];
  segmentConfig: RouteNode["segmentConfig"];
  fetches: FetchCall[];
  layouts: string[];
  hasDynamicParams: boolean;
  hasGenerateStaticParams: boolean;
  usesSuspense: boolean;
}

export interface RawScanResult {
  appDir: string;
  version: string;
  scannedAt: string;
  modules: ParsedRouteModule[];
  revalidators: Revalidator[];
  antiPatterns?: AntiPattern[];
}
