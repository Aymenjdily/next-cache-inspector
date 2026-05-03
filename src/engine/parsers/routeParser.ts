import path from "node:path";

import { Node, type SourceFile, SyntaxKind } from "ts-morph";

import type { ParsedRouteModule, RouteModuleKind } from "@/engine/types";
import type { DynamicExport, FetchCacheExport, RouteNode, RouteType } from "@/types";

export interface ParseRouteFileOptions {
  appDir: string;
  isPprEnabled: boolean;
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, "/");
}

function getModuleKind(baseName: string): RouteModuleKind | null {
  if (baseName === "page.tsx") {
    return "page";
  }

  if (baseName === "layout.tsx") {
    return "layout";
  }

  if (baseName === "route.ts") {
    return "route";
  }

  if (baseName === "loading.tsx") {
    return "loading";
  }

  if (baseName === "error.tsx") {
    return "error";
  }

  return null;
}

function isRouteRelevant(kind: RouteModuleKind): boolean {
  return kind === "page" || kind === "layout" || kind === "route";
}

function getRelativePath(appDir: string, sourceFile: SourceFile): string {
  return normalizeSlashes(path.relative(appDir, sourceFile.getFilePath()));
}

function getUrlSegments(relativePath: string, kind: RouteModuleKind): string[] {
  const directoryPath =
    kind === "route" ? path.posix.dirname(relativePath) : path.posix.dirname(relativePath);

  if (directoryPath === ".") {
    return [];
  }

  return directoryPath
    .split("/")
    .filter((segment: string) => segment.length > 0)
    .filter((segment: string) => !/^\(.+\)$/.test(segment));
}

function getUrlPath(relativePath: string, kind: RouteModuleKind): string {
  const segments = getUrlSegments(relativePath, kind);
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function hasDynamicSegments(relativePath: string): boolean {
  return relativePath.split("/").some((segment: string) => segment.includes("[") && segment.includes("]"));
}

function extractSegmentConfig(sourceFile: SourceFile): RouteNode["segmentConfig"] {
  const segmentConfig: RouteNode["segmentConfig"] = {};

  sourceFile.getVariableStatements().forEach((statement) => {
    if (!statement.isExported()) {
      return;
    }

    statement.getDeclarations().forEach((declaration) => {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();

      if (!initializer) {
        return;
      }

      if (name === "dynamic" && Node.isStringLiteral(initializer)) {
        const value = initializer.getLiteralText();

        if (value === "auto" || value === "force-dynamic" || value === "error" || value === "force-static") {
          segmentConfig.dynamic = value satisfies DynamicExport;
        }
      }

      if (name === "revalidate") {
        if (Node.isNumericLiteral(initializer)) {
          segmentConfig.revalidate = Number(initializer.getLiteralText());
        }

        if (initializer.getKind() === SyntaxKind.FalseKeyword) {
          segmentConfig.revalidate = false;
        }
      }

      if (name === "fetchCache" && Node.isStringLiteral(initializer)) {
        const value = initializer.getLiteralText();

        if (
          value === "default-cache" ||
          value === "default-no-store" ||
          value === "only-no-store" ||
          value === "force-no-store"
        ) {
          segmentConfig.fetchCache = value satisfies FetchCacheExport;
        }
      }
    });
  });

  return segmentConfig;
}

function hasExportedGenerateStaticParams(sourceFile: SourceFile): boolean {
  if (sourceFile.getFunction("generateStaticParams")?.isExported()) {
    return true;
  }

  return sourceFile
    .getVariableStatements()
    .some((statement) => statement.isExported() && statement.getDeclarations().some((declaration) => declaration.getName() === "generateStaticParams"));
}

function usesSuspenseBoundary(sourceFile: SourceFile): boolean {
  const openingElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const selfClosingElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);

  return [...openingElements, ...selfClosingElements].some((element) => {
    const tagName = element.getTagNameNode().getText();
    return tagName === "Suspense" || tagName === "React.Suspense";
  });
}

/**
 * Determines the effective route type for a parsed module.
 */
export function determineRouteType(
  segmentConfig: RouteNode["segmentConfig"],
  hasDynamicParams: boolean,
  hasGenerateStaticParams: boolean,
  isPprEnabled: boolean,
  usesSuspense: boolean,
): RouteType {
  if (segmentConfig.dynamic === "force-dynamic") {
    return "dynamic";
  }

  if (hasDynamicParams && !hasGenerateStaticParams) {
    return "dynamic";
  }

  if (segmentConfig.revalidate !== undefined && segmentConfig.revalidate !== false) {
    return "ISR";
  }

  if (isPprEnabled && usesSuspense) {
    return "PPR";
  }

  return "static";
}

/**
 * Parses route-related metadata from a source file.
 */
export function parseRouteFile(sourceFile: SourceFile, options: ParseRouteFileOptions): ParsedRouteModule | null {
  const kind = getModuleKind(sourceFile.getBaseName());

  if (!kind || !isRouteRelevant(kind)) {
    return null;
  }

  const relativePath = getRelativePath(options.appDir, sourceFile);
  const hasGenerateStaticParams = hasExportedGenerateStaticParams(sourceFile);
  const hasDynamicParams = hasDynamicSegments(relativePath);
  const segmentConfig = extractSegmentConfig(sourceFile);
  const usesSuspense = usesSuspenseBoundary(sourceFile);

  return {
    id: relativePath,
    kind,
    sourceFile: sourceFile.getFilePath(),
    path: getUrlPath(relativePath, kind),
    type: determineRouteType(
      segmentConfig,
      hasDynamicParams,
      hasGenerateStaticParams,
      options.isPprEnabled,
      usesSuspense,
    ),
    segmentConfig,
    fetches: [],
    layouts: [],
    hasDynamicParams,
    hasGenerateStaticParams,
    usesSuspense,
  };
}
