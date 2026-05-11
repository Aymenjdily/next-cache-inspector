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
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import RouteNode, { type RouteFlowNode, type RouteNodeData } from "@/app/_components/RouteNode";
import { useInspectorStore } from "@/app/_store/inspectorStore";
import type { CacheGraph, CacheTag, Revalidator, RouteNode as RouteNodeSchema } from "@/types";

type FlowNodeData = Record<string, unknown> & {
  label: string;
  subtitle?: string;
  blastRadius?: string;
  opacity: number;
  onClick?: () => void;
};

type FlowDisplayNode = Node<FlowNodeData>;
type FlowDisplayEdge = Edge;

const ROUTE_NODE_WIDTH = 240;
const ROUTE_NODE_HEIGHT = 80;

function FlowInfoNode({ data }: NodeProps<FlowDisplayNode>): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={data.onClick}
      className="flex min-h-14 min-w-44 flex-col rounded-lg border border-[#333] bg-[#111] p-3 text-left transition-colors hover:bg-[#1a1a1a]"
      style={{ opacity: data.opacity }}
    >
      <span className="font-mono text-xs font-medium text-white">{data.label}</span>
      {data.subtitle ? <span className="mt-1 text-sm text-gray-400">{data.subtitle}</span> : null}
      {data.blastRadius ? <span className="mt-2 text-[11px] font-medium text-gray-300">{data.blastRadius}</span> : null}
    </button>
  );
}

function InvalidationFlowEdge(props: EdgeProps): React.JSX.Element {
  const [path] = getSmoothStepPath(props);
  return <BaseEdge path={path} style={{ stroke: "#a855f7", strokeWidth: 1.5 }} />;
}

const nodeTypes: NodeTypes = {
  routeNode: RouteNode,
  tagNode: FlowInfoNode,
  revalidatorNode: FlowInfoNode,
};

const edgeTypes = {
  invalidationFlow: InvalidationFlowEdge,
};

function getRouteSourcePath(graph: CacheGraph, route: RouteNodeSchema): string {
  if (route.fetches[0]?.sourceFile) return route.fetches[0].sourceFile;
  return `${graph.meta.appDir.replace(/\\/g, "/")}/${route.id}`;
}

function getConnectedGraph(
  graph: CacheGraph,
  selectedRevalidatorId: string | null,
): {
  connectedTagNames: Set<string>;
  connectedRouteIds: Set<string>;
  selectedRevalidator: Revalidator | null;
} {
  if (!selectedRevalidatorId) {
    return { connectedTagNames: new Set<string>(), connectedRouteIds: new Set<string>(), selectedRevalidator: null };
  }

  const selectedRevalidator = graph.revalidators.find((revalidator) => revalidator.id === selectedRevalidatorId) ?? null;
  if (!selectedRevalidator) {
    return { connectedTagNames: new Set<string>(), connectedRouteIds: new Set<string>(), selectedRevalidator: null };
  }

  if (selectedRevalidator.type === "tag") {
    const connectedTag = graph.tags.find((tag) => tag.name === selectedRevalidator.target);
    return {
      connectedTagNames: new Set(connectedTag ? [connectedTag.name] : []),
      connectedRouteIds: new Set(connectedTag?.usedBy ?? []),
      selectedRevalidator,
    };
  }

  const connectedRoutes = graph.routes.filter((route) => route.path === selectedRevalidator.target);
  const connectedTags = graph.tags.filter((tag) => tag.usedBy.some((routeId) => connectedRoutes.some((route) => route.id === routeId)));

  return {
    connectedTagNames: new Set(connectedTags.map((tag) => tag.name)),
    connectedRouteIds: new Set(connectedRoutes.map((route) => route.id)),
    selectedRevalidator,
  };
}

function buildFlowNodes(
  graph: CacheGraph,
  selectedRevalidatorId: string | null,
  onOpenSource: (sourcePath: string) => void,
  onSelectRoute: (id: string) => void,
  onSelectRevalidator: (id: string | null) => void,
): Array<FlowDisplayNode | RouteFlowNode> {
  const { connectedRouteIds, connectedTagNames, selectedRevalidator } = getConnectedGraph(graph, selectedRevalidatorId);
  const shouldFade = selectedRevalidator !== null;

  const revalidatorNodes: FlowDisplayNode[] = graph.revalidators.map((revalidator) => {
    const connectedTags =
      revalidator.type === "tag"
        ? graph.tags.filter((tag) => tag.name === revalidator.target)
        : graph.tags.filter((tag) => tag.usedBy.some((routeId) => graph.routes.some((route) => route.id === routeId && route.path === revalidator.target)));
    const connectedRoutes =
      revalidator.type === "tag"
        ? graph.routes.filter((route) => connectedTags.some((tag) => tag.usedBy.includes(route.id)))
        : graph.routes.filter((route) => route.path === revalidator.target);

    return {
      id: revalidator.id,
      type: "revalidatorNode",
      position: { x: 0, y: 0 },
      data: {
        label: revalidator.target,
        subtitle: `${revalidator.type} revalidator`,
        blastRadius: `Affects ${connectedRoutes.length} routes, ${connectedTags.length} tags`,
        opacity: shouldFade && selectedRevalidatorId !== revalidator.id ? 0.3 : 1,
        onClick: (): void => onSelectRevalidator(revalidator.id),
      },
    };
  });

  const tagNodes: FlowDisplayNode[] = graph.tags.map((tag) => ({
    id: `tag:${tag.name}`,
    type: "tagNode",
    position: { x: 0, y: 0 },
    data: {
      label: tag.name,
      subtitle: `${tag.usedBy.length} routes`,
      opacity: shouldFade && !connectedTagNames.has(tag.name) ? 0.3 : 1,
    },
  }));

  const routeNodes: RouteFlowNode[] = graph.routes.map((route) => {
    const tagCount = graph.tags.filter((tag) => tag.usedBy.includes(route.id)).length;
    return {
      id: route.id,
      type: "routeNode",
      position: { x: 0, y: 0 },
      selected: false,
      data: {
        ...route,
        width: ROUTE_NODE_WIDTH,
        height: ROUTE_NODE_HEIGHT,
        tagCount,
        sourcePath: getRouteSourcePath(graph, route),
        onSelectRoute,
        onOpenSource,
      },
      width: ROUTE_NODE_WIDTH,
      height: ROUTE_NODE_HEIGHT,
      style: {
        opacity: shouldFade && !connectedRouteIds.has(route.id) ? 0.3 : 1,
      },
    };
  });

  return [...revalidatorNodes, ...tagNodes, ...routeNodes];
}

function buildFlowEdges(graph: CacheGraph): FlowDisplayEdge[] {
  const edges: FlowDisplayEdge[] = [];

  graph.revalidators.forEach((revalidator) => {
    if (revalidator.type === "tag") {
      edges.push({
        id: `${revalidator.id}->tag:${revalidator.target}`,
        source: revalidator.id,
        target: `tag:${revalidator.target}`,
        type: "invalidationFlow",
        animated: true,
      });
    } else {
      const routes = graph.routes.filter((route) => route.path === revalidator.target);
      routes.forEach((route) => {
        edges.push({
          id: `${revalidator.id}->${route.id}`,
          source: revalidator.id,
          target: route.id,
          type: "invalidationFlow",
          animated: true,
        });
      });
    }
  });

  graph.tags.forEach((tag) => {
    tag.usedBy.forEach((routeId) => {
      edges.push({
        id: `tag:${tag.name}->${routeId}`,
        source: `tag:${tag.name}`,
        target: routeId,
        type: "invalidationFlow",
        animated: true,
      });
    });
  });

  return edges;
}

function layoutGraph(nodes: Array<FlowDisplayNode | RouteFlowNode>, edges: FlowDisplayEdge[]): Array<FlowDisplayNode | RouteFlowNode> {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: "LR",
    nodesep: 48,
    ranksep: 96,
    marginx: 24,
    marginy: 24,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const width = "width" in node && typeof node.width === "number" ? node.width : 180;
    const height = "height" in node && typeof node.height === "number" ? node.height : 64;
    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const positionedNode = graph.node(node.id);
    const width = "width" in node && typeof node.width === "number" ? node.width : 180;
    const height = "height" in node && typeof node.height === "number" ? node.height : 64;

    return {
      ...node,
      position: {
        x: positionedNode.x - width / 2,
        y: positionedNode.y - height / 2,
      },
    };
  });
}

function FlowGraph({
  graph,
}: Readonly<{
  graph: CacheGraph;
}>): React.JSX.Element {
  const selectedRevalidatorId = useInspectorStore((state) => state.selectedRevalidatorId);
  const selectRevalidator = useInspectorStore((state) => state.selectRevalidator);
  const selectRoute = useInspectorStore((state) => state.selectRoute);
  const setHighlightMode = useInspectorStore((state) => state.setHighlightMode);
  const reactFlow = useReactFlow<Array<FlowDisplayNode | RouteFlowNode>[number], FlowDisplayEdge>();

  const edges = useMemo(() => buildFlowEdges(graph), [graph]);
  const nodes = useMemo(
    () =>
      layoutGraph(
        buildFlowNodes(
          graph,
          selectedRevalidatorId,
          (sourcePath: string): void => {
            window.location.href = `vscode://file/${sourcePath}`;
          },
          (id: string): void => selectRoute(id),
          (id: string | null): void => {
            selectRevalidator(id);
            setHighlightMode(id ? "revalidator" : "none");
          },
        ),
        edges,
      ),
    [edges, graph, selectRevalidator, selectRoute, selectedRevalidatorId, setHighlightMode],
  );

  useEffect((): void => {
    reactFlow.fitView({ padding: 0.2 });
  }, [edges, nodes, reactFlow]);

  return (
    <div className="relative h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#333] bg-[#111]">
      <ReactFlow<Array<FlowDisplayNode | RouteFlowNode>[number], FlowDisplayEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={(): void => {
          selectRevalidator(null);
          setHighlightMode("none");
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={24} />
        <Controls className="!border-[#333] !bg-[#111] !text-gray-300" />
        <MiniMap pannable zoomable nodeColor="#444" maskColor="rgba(0, 0, 0, 0.75)" className="!border !border-[#333] !bg-[#111]" />
      </ReactFlow>
    </div>
  );
}

export default function FlowViewClient(): React.JSX.Element | null {
  const graph = useInspectorStore((state) => state.graph);
  if (!graph) return null;
  return (
    <ReactFlowProvider>
      <FlowGraph graph={graph} />
    </ReactFlowProvider>
  );
}
