import path from "node:path";

import { runRules } from "@/engine/rules/antiPatterns";
import type { ParsedRouteModule, RawScanResult } from "@/engine/types";
import type { CacheGraph, CacheTag, RouteNode } from "@/types";

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, "/");
}

function getLayoutsForRoute(routeModule: ParsedRouteModule, layoutModules: ParsedRouteModule[]): string[] {
  if (routeModule.kind === "route") {
    return [];
  }

  const routeDirectory = path.posix.dirname(routeModule.id);
  const routeSegments = routeDirectory === "." ? [] : routeDirectory.split("/");
  const layouts: string[] = [];

  for (let index = 0; index <= routeSegments.length; index += 1) {
    const directory = routeSegments.slice(0, index).join("/");
    const expectedLayoutId = directory ? `${directory}/layout.tsx` : "layout.tsx";
    const layoutMatch = layoutModules.find((layoutModule) => layoutModule.id === expectedLayoutId);

    if (layoutMatch) {
      layouts.push(layoutMatch.id);
    }
  }

  return layouts;
}

function buildRoutes(raw: RawScanResult): RouteNode[] {
  const layoutModules = raw.modules.filter((module) => module.kind === "layout");

  return raw.modules
    .filter((module) => module.kind === "page" || module.kind === "route")
    .map((module) => ({
      id: module.id,
      path: module.path,
      type: module.type,
      segmentConfig: module.segmentConfig,
      fetches: module.fetches,
      layouts: getLayoutsForRoute(module, layoutModules),
    }));
}

function getTagsForRoute(route: RouteNode, layoutModules: ParsedRouteModule[]): string[] {
  const layoutTags = layoutModules
    .filter((layoutModule) => route.layouts.includes(layoutModule.id))
    .flatMap((layoutModule) => layoutModule.fetches.flatMap((fetchCall) => fetchCall.tags));

  return [...route.fetches.flatMap((fetchCall) => fetchCall.tags), ...layoutTags];
}

function buildTags(routes: RouteNode[], raw: RawScanResult): CacheTag[] {
  const layoutModules = raw.modules.filter((module) => module.kind === "layout");
  const tagNames = new Set<string>();

  routes.forEach((route) => {
    getTagsForRoute(route, layoutModules).forEach((tag) => tagNames.add(tag));
  });

  return [...tagNames]
    .sort((left, right) => left.localeCompare(right))
    .map((tagName) => ({
      name: tagName,
      usedBy: routes
        .filter((route) => getTagsForRoute(route, layoutModules).includes(tagName))
        .map((route) => route.id),
      invalidatedBy: raw.revalidators
        .filter((revalidator) => revalidator.type === "tag" && revalidator.target === tagName)
        .map((revalidator) => revalidator.id),
    }));
}

/**
 * Builds the final `CacheGraph` from parsed engine scan data.
 */
export function buildGraph(raw: RawScanResult): CacheGraph {
  const routes = buildRoutes(raw);
  const graph: CacheGraph = {
    routes,
    tags: buildTags(routes, raw),
    revalidators: raw.revalidators,
    antiPatterns: [],
    meta: {
      appDir: normalizeSlashes(raw.appDir),
      scannedAt: raw.scannedAt,
      version: raw.version,
    },
  };

  graph.antiPatterns = runRules(graph, raw);

  return graph;
}
