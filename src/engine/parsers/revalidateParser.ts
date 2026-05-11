import { Node, type CallExpression, type SourceFile, SyntaxKind } from "ts-morph";

import * as logger from "@/engine/logger";
import type { Revalidator } from "@/types";

const REVALIDATOR_NAMES = new Set(["revalidateTag", "revalidatePath", "updateTag"]);

function getLineAndColumn(sourceFile: SourceFile, position: number): { line: number; column: number } {
  return sourceFile.getLineAndColumnAtPos(position);
}

function getTargetLiteral(argument: Node | undefined): string | undefined {
  if (!argument) return undefined;
  if (Node.isStringLiteral(argument) || Node.isNoSubstitutionTemplateLiteral(argument)) {
    return argument.getLiteralText();
  }
  return undefined;
}

function getRevalidatorType(expressionText: string): Revalidator["type"] {
  return expressionText === "revalidatePath" ? "path" : "tag";
}

function buildRevalidator(sourceFile: SourceFile, callExpression: CallExpression): Revalidator {
  const expressionText = callExpression.getExpression().getText();
  const targetArgument = callExpression.getArguments()[0];
  const literalTarget = getTargetLiteral(targetArgument);
  const location = getLineAndColumn(sourceFile, callExpression.getStart());

  if (!literalTarget) {
    logger.debug(
      `Non-literal ${expressionText} target in ${sourceFile.getFilePath()}:${location.line}; falling back to "unknown".`,
    );
  }

  return {
    id: `${sourceFile.getFilePath()}:${location.line}:${location.column}`,
    type: getRevalidatorType(expressionText),
    target: literalTarget ?? "unknown",
    sourceFile: sourceFile.getFilePath(),
    line: location.line,
  };
}

/**
 * Parses cache invalidation calls from a source file.
 * Scans ALL files — revalidateTag/revalidatePath can live in any Server Component,
 * Server Action, Route Handler, or API route in a Next.js App Router project.
 */
export function parseRevalidators(sourceFile: SourceFile): Revalidator[] {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((callExpression: CallExpression) => REVALIDATOR_NAMES.has(callExpression.getExpression().getText()))
    .map((callExpression: CallExpression) => buildRevalidator(sourceFile, callExpression));
}
