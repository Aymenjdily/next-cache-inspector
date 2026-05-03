import type { RawScanResult } from "@/engine/types";
import type { AntiPattern, CacheGraph, FetchCall, RouteNode } from "@/types";

function createAntiPattern(
  rule: AntiPattern["rule"],
  severity: AntiPattern["severity"],
  message: string,
  sourceFile: string,
  line: number,
): AntiPattern {
  return {
    id: `${rule}:${sourceFile}:${line}`,
    severity,
    message,
    sourceFile,
    line,
    rule,
  };
}

function getLayoutModules(raw: RawScanResult): RawScanResult["modules"] {
  return raw.modules.filter((module) => module.kind === "layout");
}

function getRouteModules(raw: RawScanResult): RawScanResult["modules"] {
  return raw.modules.filter((module) => module.kind === "page" || module.kind === "route");
}

function getRouteById(graph: CacheGraph, routeId: string): RouteNode | undefined {
  return graph.routes.find((route) => route.id === routeId);
}

function getAllLayoutFetches(raw: RawScanResult): FetchCall[] {
  return getLayoutModules(raw).flatMap((module) => module.fetches);
}

function findNoStoreWithRevalidate(raw: RawScanResult): AntiPattern[] {
  return [...graphFetches(raw), ...getAllLayoutFetches(raw)]
    .filter((fetchCall) => fetchCall.cache === "no-store" && fetchCall.revalidate !== undefined)
    .map((fetchCall) =>
      createAntiPattern(
        "no-store-with-revalidate",
        "error",
        "fetch() uses cache: 'no-store' with revalidate. These options conflict - no-store disables caching entirely.",
        fetchCall.sourceFile,
        fetchCall.line,
      ),
    );
}

function graphFetches(raw: RawScanResult): FetchCall[] {
  return getRouteModules(raw).flatMap((module) => module.fetches);
}

function findIsrUntaggedFetch(graph: CacheGraph): AntiPattern[] {
  return graph.routes.flatMap((route) =>
    route.type === "ISR"
      ? route.fetches
          .filter((fetchCall) => fetchCall.tags.length === 0)
          .map((fetchCall) =>
            createAntiPattern(
              "isr-untagged-fetch",
              "warning",
              "ISR route has untagged fetch. Without tags, you cannot revalidate this fetch precisely.",
              fetchCall.sourceFile,
              fetchCall.line,
            ),
          )
      : [],
  );
}

function findOrphanRevalidateTag(graph: CacheGraph): AntiPattern[] {
  const tagNames = new Set(graph.tags.map((tag) => tag.name));

  return graph.revalidators
    .filter((revalidator) => revalidator.type === "tag" && !tagNames.has(revalidator.target))
    .map((revalidator) =>
      createAntiPattern(
        "orphan-revalidate-tag",
        "warning",
        `revalidateTag('${revalidator.target}') targets a tag that is never used in any fetch().`,
        revalidator.sourceFile,
        revalidator.line,
      ),
    );
}

function findForceDynamicWithRevalidate(graph: CacheGraph): AntiPattern[] {
  return graph.routes
    .filter(
      (route) =>
        route.segmentConfig.dynamic === "force-dynamic" && route.segmentConfig.revalidate !== undefined,
    )
    .map((route) =>
      createAntiPattern(
        "force-dynamic-with-revalidate",
        "error",
        "Route exports both force-dynamic and revalidate. force-dynamic disables static generation; revalidate has no effect.",
        route.fetches[0]?.sourceFile ?? route.id,
        route.fetches[0]?.line ?? 1,
      ),
    );
}

function hasSameRouteTree(graph: CacheGraph, parentLayoutId: string, childLayoutId: string): boolean {
  return graph.routes.some(
    (route) => route.layouts.includes(parentLayoutId) && route.layouts.includes(childLayoutId),
  );
}

function getLayoutDepth(layoutId: string): number {
  return layoutId.split("/").length;
}

function findLayoutFetchConflict(graph: CacheGraph, raw: RawScanResult): AntiPattern[] {
  const layouts = getLayoutModules(raw);
  const antiPatterns = new Map<string, AntiPattern>();

  layouts.forEach((parentLayout) => {
    layouts.forEach((childLayout) => {
      if (
        parentLayout.id === childLayout.id ||
        getLayoutDepth(parentLayout.id) >= getLayoutDepth(childLayout.id) ||
        !hasSameRouteTree(graph, parentLayout.id, childLayout.id)
      ) {
        return;
      }

      parentLayout.fetches.forEach((parentFetch) => {
        if (!parentFetch.url) {
          return;
        }

        childLayout.fetches.forEach((childFetch) => {
          if (
            childFetch.url === parentFetch.url &&
            (childFetch.cache !== parentFetch.cache || childFetch.revalidate !== parentFetch.revalidate)
          ) {
            const antiPattern = createAntiPattern(
              "layout-fetch-conflict",
              "warning",
              `Conflicting fetch configurations for ${childFetch.url} in parent and child layouts.`,
              childFetch.sourceFile,
              childFetch.line,
            );

            antiPatterns.set(antiPattern.id, antiPattern);
          }
        });
      });
    });
  });

  return [...antiPatterns.values()];
}

/**
 * Runs all cache anti-pattern rules against the assembled scan result.
 */
export function runRules(graph: CacheGraph, raw: RawScanResult): AntiPattern[] {
  return [
    ...findNoStoreWithRevalidate(raw),
    ...findIsrUntaggedFetch(graph),
    ...findOrphanRevalidateTag(graph),
    ...findForceDynamicWithRevalidate(graph),
    ...findLayoutFetchConflict(graph, raw),
  ];
}
