"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { isEmbeddedMode } from "@/lib/runtimeMode";

export interface RevalidateActionResult {
  success: boolean;
  error?: string;
}

/**
 * Revalidates a cache tag when running in embedded mode.
 */
export async function revalidateTagAction(tag: string): Promise<RevalidateActionResult> {
  if (!isEmbeddedMode()) {
    return {
      success: false,
      error: "Standalone mode: revalidation requires embedded mode.",
    };
  }

  try {
    revalidateTag(tag);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Standalone mode: revalidation requires embedded mode.",
    };
  }
}

/**
 * Revalidates a route path when running in embedded mode.
 */
export async function revalidatePathAction(routePath: string): Promise<RevalidateActionResult> {
  if (!isEmbeddedMode()) {
    return {
      success: false,
      error: "Standalone mode: revalidation requires embedded mode.",
    };
  }

  try {
    revalidatePath(routePath);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Standalone mode: revalidation requires embedded mode.",
    };
  }
}
