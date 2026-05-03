"use client";

import { useEffect, useMemo } from "react";
import dagre from "dagre";
import {
  Background,
  BaseEdge,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import DetailSidebar from "@/app/_components/DetailSidebar";
import RouteNode, { type RouteFlowNode, type RouteNodeData } from "@/app/_components/RouteNode";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph, RouteNode as RouteNodeSchema } from "@/types";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 80;

type TopologyEdge = Edge;
type TopologyNode = RouteFlowNode;

const nodeTypes: NodeTypes = {
  routeNode: RouteNode,
};

function LayoutWrapEdge(props: EdgeProps): React.JSX.Element {
  const [path] = getSmoothStepPath(props);

  return <BaseEdge path={path} style={{ stroke: "#71717a", strokeDasharray: "6 4" }} />;
}

const edgeTypes = {
  layoutWrap: LayoutWrapEdge,
};

function getRouteSourcePath(graph: CacheGraph, route: RouteNodeSchema): string {
  if (route.fetches[0]?.sourceFile) {
    return route.fetches[0].sourceFile;
  }

  return `${graph.meta.appDir.replace(/\\/g, "/")}/${route.id}`;
}

function createLayoutRouteNode(graph: CacheGraph, layoutId: string): RouteNodeData {
  const layoutPath = layoutId === "layout.tsx" ? "/" : `/${layoutId.replace(/\/layout\.tsx$/, "")}`;

  return {
    id: layoutId,
    path: layoutPath,
    type: "static",
    segmentConfig: {},
    fetches: [],
    layouts: [],
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    tagCount: 0,
    sourcePath: `${graph.meta.appDir.replace(/\\/g, "/")}/${layoutId}`,
    isLayout: true,
    onSelectRoute: (): void => undefined,
    onOpenSource: (): void => undefined,
  };
}

function buildLayoutRecords(graph: CacheGraph): string[] {
  const layoutIds = new Set<string>();

  graph.routes.forEach((route) => {
    route.layouts.forEach((layoutId) => {
      layoutIds.add(layoutId);
    });
  });

  return [...layoutIds.values()];
}

function buildNodes(
  graph: CacheGraph,
  selectedRouteId: string | null,
  onSelectRoute: (id: string) => void,
  onOpenSource: (sourcePath: string) => void,
): TopologyNode[] {
  const routeNodes: TopologyNode[] = graph.routes.map((route) => {
    const routeTags = graph.tags.filter((tag) => tag.usedBy.includes(route.id));

    return {
      id: route.id,
      type: "routeNode",
      position: { x: 0, y: 0 },
      selected: route.id === selectedRouteId,
      data: {
        ...route,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        tagCount: routeTags.length,
        sourcePath: getRouteSourcePath(graph, route),
        onSelectRoute,
        onOpenSource,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
  });

  const layoutNodes: TopologyNode[] = buildLayoutRecords(graph).map((layoutId) => ({
    id: layoutId,
    type: "routeNode",
    position: { x: 0, y: 0 },
    selected: false,
    data: {
      ...createLayoutRouteNode(graph, layoutId),
      onOpenSource,
    },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }));

  return [...layoutNodes, ...routeNodes];
}

function buildEdges(graph: CacheGraph): TopologyEdge[] {
  const edges = new Map<string, TopologyEdge>();

  graph.routes.forEach((route) => {
    route.layouts.forEach((layoutId, index) => {
      const targetId = index === route.layouts.length - 1 ? route.id : route.layouts[index + 1];
      const edgeId = `${layoutId}->${targetId}`;

      if (!edges.has(edgeId)) {
        edges.set(edgeId, {
          id: edgeId,
          source: layoutId,
          target: targetId,
          type: "layoutWrap",
        });
      }
    });
  });

  return [...edges.values()];
}

function layoutGraph(nodes: TopologyNode[], edges: TopologyEdge[]): TopologyNode[] {
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: "TB",
    nodesep: 40,
    ranksep: 56,
    marginx: 24,
    marginy: 24,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.data.width,
      height: node.data.height,
    });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const positionedNode = graph.node(node.id);

    return {
      ...node,
      position: {
        x: positionedNode.x - NODE_WIDTH / 2,
        y: positionedNode.y - NODE_HEIGHT / 2,
      },
    };
  });
}

function getSelectedRoute(graph: CacheGraph, selectedRouteId: string | null): RouteNodeSchema | null {
  if (!selectedRouteId) {
    return null;
  }

  return graph.routes.find((route) => route.id === selectedRouteId) ?? null;
}

function TopologyFlow({
  graph,
}: Readonly<{
  graph: CacheGraph;
}>): React.JSX.Element {
  const selectedRouteId = useInspectorStore((state) => state.selectedRouteId);
  const selectRoute = useInspectorStore((state) => state.selectRoute);
  const reactFlow = useReactFlow<TopologyNode, TopologyEdge>();

  const edges = useMemo(() => buildEdges(graph), [graph]);
  const nodes = useMemo(
    () =>
      layoutGraph(
        buildNodes(
          graph,
          selectedRouteId,
          (id: string): void => {
            if (graph.routes.some((route) => route.id === id)) {
              selectRoute(id);
            }
          },
          (sourcePath: string): void => {
            window.location.href = `vscode://file/${sourcePath}`;
          },
        ),
        edges,
      ),
    [edges, graph, selectRoute, selectedRouteId],
  );
  const selectedRoute = getSelectedRoute(graph, selectedRouteId);

  useEffect((): void => {
    reactFlow.fitView({ padding: 0.2 });
  }, [nodes, edges, reactFlow]);

  return (
    <div className="relative h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <ReactFlow<TopologyNode, TopologyEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_event: React.MouseEvent, node: Node<RouteNodeData>): void => {
          if (graph.routes.some((route) => route.id === node.id)) {
            selectRoute(node.id);
          }
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={24} />
        <Controls className="!border-zinc-800 !bg-zinc-900 !text-zinc-200" />
        <MiniMap
          pannable
          zoomable
          nodeColor="#3f3f46"
          maskColor="rgba(9, 9, 11, 0.75)"
          className="!border !border-zinc-800 !bg-zinc-900"
        />
      </ReactFlow>

      {selectedRoute ? <DetailSidebar graph={graph} route={selectedRoute} /> : null}
    </div>
  );
}

export default function TopologyCanvas(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);

  if (!graph) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <TopologyFlow graph={graph} />
    </ReactFlowProvider>
  );
}
