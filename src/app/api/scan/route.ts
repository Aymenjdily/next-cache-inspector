import fs from "node:fs/promises";

import { NextResponse, type NextRequest } from "next/server";

import { getStandaloneGraphFilePath, setCurrentGraph } from "@/app/_lib/graphState";
import { analyze, writeGraph } from "@/engine";
import { EngineError } from "@/engine/errors";
import { isEmbeddedMode } from "@/lib/runtimeMode";

interface ScanRequestBody {
  appDir?: string;
}

async function isDirectory(targetPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ScanRequestBody;

  try {
    body = (await request.json()) as ScanRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.appDir || !(await isDirectory(body.appDir))) {
    return NextResponse.json({ error: "appDir missing or not a valid directory." }, { status: 400 });
  }

  try {
    const graph = await analyze(body.appDir);
    setCurrentGraph(graph);

    if (!isEmbeddedMode()) {
      await writeGraph(graph, getStandaloneGraphFilePath());
    }

    return NextResponse.json({ graph });
  } catch (error) {
    if (error instanceof EngineError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Engine crash." }, { status: 500 });
  }
}
