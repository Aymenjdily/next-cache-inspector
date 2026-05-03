import { NextResponse } from "next/server";

import { getAvailableGraph } from "@/app/_lib/graphState";

export async function GET(): Promise<NextResponse> {
  const graph = await getAvailableGraph();

  if (!graph) {
    return NextResponse.json({ error: "No scan data available. Run a scan first." }, { status: 404 });
  }

  return NextResponse.json(graph);
}
