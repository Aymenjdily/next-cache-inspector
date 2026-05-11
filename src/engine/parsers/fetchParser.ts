import { Node, type ArrayLiteralExpression, type CallExpression, type ObjectLiteralExpression, type SourceFile, SyntaxKind } from "ts-morph";

import type { FetchCall } from "@/types";

function getLineAndColumn(sourceFile: SourceFile, position: number): { line: number; column: number } {
  return sourceFile.getLineAndColumnAtPos(position);
}

function getLiteralString(node: Node | undefined): string | undefined {
  if (!node) return undefined;
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }
  return undefined;
}

function getObjectProperty(objectNode: ObjectLiteralExpression, propertyName: string): Node | undefined {
  const property = objectNode.getProperty(propertyName);
  if (!property) return undefined;
  if (Node.isPropertyAssignment(property)) {
    return property.getInitializer() ?? undefined;
  }
  return undefined;
}

function getTagsArray(node: Node | undefined): string[] {
  if (!node || !Node.isArrayLiteralExpression(node)) return [];
  return node
    .getElements()
    .flatMap((element: Node) => {
      const literalValue = getLiteralString(element);
      return literalValue ? [literalValue] : [];
    });
}

function getCacheValue(objectNode: ObjectLiteralExpression, nextNode: ObjectLiteralExpression | undefined): FetchCall["cache"] {
  const topLevelCache = getLiteralString(getObjectProperty(objectNode, "cache"));
  const nestedCache = nextNode ? getLiteralString(getObjectProperty(nextNode, "cache")) : undefined;
  const cacheValue = topLevelCache ?? nestedCache;

  if (cacheValue === "force-cache" || cacheValue === "no-store") {
    return cacheValue;
  }
  return undefined;
}

function getRevalidateValue(node: Node | undefined): number | false | undefined {
  if (!node) return undefined;
  if (Node.isNumericLiteral(node)) return Number(node.getLiteralText());
  if (node.getKind() === SyntaxKind.FalseKeyword) return false;
  return undefined;
}

function getNextConfigNode(callExpression: CallExpression): ObjectLiteralExpression | undefined {
  const optionsArgument = callExpression.getArguments()[1];
  if (!optionsArgument || !Node.isObjectLiteralExpression(optionsArgument)) return undefined;
  const nextInitializer = getObjectProperty(optionsArgument, "next");
  if (nextInitializer && Node.isObjectLiteralExpression(nextInitializer)) {
    return nextInitializer;
  }
  return undefined;
}

function buildFetchId(sourceFile: SourceFile, callExpression: CallExpression): string {
  const { line, column } = getLineAndColumn(sourceFile, callExpression.getStart());
  return `${sourceFile.getFilePath()}:${line}:${column}`;
}

function getUrlValue(callExpression: CallExpression): string | undefined {
  const urlArgument = callExpression.getArguments()[0];
  return getLiteralString(urlArgument);
}

function createFetchCall(sourceFile: SourceFile, callExpression: CallExpression): FetchCall {
  const optionsArgument = callExpression.getArguments()[1];
  const nextNode = getNextConfigNode(callExpression);
  const configNode = Node.isObjectLiteralExpression(optionsArgument) ? optionsArgument : undefined;
  const location = getLineAndColumn(sourceFile, callExpression.getStart());

  return {
    id: buildFetchId(sourceFile, callExpression),
    sourceFile: sourceFile.getFilePath(),
    line: location.line,
    url: getUrlValue(callExpression),
    cache: configNode ? getCacheValue(configNode, nextNode) : undefined,
    revalidate: getRevalidateValue(nextNode ? getObjectProperty(nextNode, "revalidate") : undefined),
    tags: getTagsArray(nextNode ? getObjectProperty(nextNode, "tags") : undefined),
  };
}

function createCacheCall(sourceFile: SourceFile, callExpression: CallExpression, callType: string): FetchCall {
  const fnArgument = callExpression.getArguments()[0];
  const optionsArgument = callExpression.getArguments()[2]; // unstable_cache(fn, key, options)
  const location = getLineAndColumn(sourceFile, callExpression.getStart());

  let url: string | undefined;
  if (Node.isArrowFunction(fnArgument)) {
    const body = fnArgument.getBody();
    if (Node.isCallExpression(body) && body.getExpression().getText() === "fetch") {
      url = getLiteralString(body.getArguments()[0]);
    }
  }

  const configNode = Node.isObjectLiteralExpression(optionsArgument) ? optionsArgument : undefined;

  return {
    id: buildFetchId(sourceFile, callExpression),
    sourceFile: sourceFile.getFilePath(),
    line: location.line,
    url: url ?? `${callType}(...)`,
    cache: configNode ? getCacheValue(configNode, undefined) : undefined,
    revalidate: getRevalidateValue(configNode ? getObjectProperty(configNode, "revalidate") : undefined),
    tags: getTagsArray(configNode ? getObjectProperty(configNode, "tags") : undefined),
  };
}

/**
 * Parses direct `fetch()` calls and `unstable_cache()` / `cache()` calls from a source file.
 */
export function parseFetches(sourceFile: SourceFile): FetchCall[] {
  const fetches: FetchCall[] = [];

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const exprText = callExpression.getExpression().getText();

    if (exprText === "fetch") {
      fetches.push(createFetchCall(sourceFile, callExpression));
    } else if (exprText === "unstable_cache" || exprText === "cache") {
      fetches.push(createCacheCall(sourceFile, callExpression, exprText));
    }
  }

  return fetches;
}
