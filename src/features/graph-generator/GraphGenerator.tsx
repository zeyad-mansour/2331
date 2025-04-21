import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  BackgroundVariant,
  MiniMap,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  generateRandomGraph,
  toAdjacencyList,
  toAdjacencyMatrix,
  generateCircularLayout,
} from "../../lib/graph";

// Define node styles for better visualization
const nodeStyle = {
  padding: "10px",
  borderRadius: "50%",
  width: 50,
  height: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: "bold",
  border: "2px solid #1a192b",
  backgroundColor: "#ffffff",
  color: "#1a192b",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const GraphGenerator: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [numNodes, setNumNodes] = useState<number>(5);
  const [numEdges, setNumEdges] = useState<number>(7);
  const [weighted, setWeighted] = useState<boolean>(false);
  const [showAdjacencyList, setShowAdjacencyList] = useState<boolean>(false);
  const [showAdjacencyMatrix, setShowAdjacencyMatrix] =
    useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(800);
  const [viewportHeight, setViewportHeight] = useState<number>(400);

  // Update viewport dimensions when component mounts and on window resize
  useEffect(() => {
    const updateDimensions = () => {
      // Get the actual viewport dimensions (this could be replaced with ref-based measurement)
      const graphContainer = document.querySelector(
        ".react-flow"
      ) as HTMLElement;
      if (graphContainer) {
        setViewportWidth(graphContainer.clientWidth);
        setViewportHeight(graphContainer.clientHeight);
      } else {
        // Fallback dimensions
        setViewportWidth(800);
        setViewportHeight(400);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Generate a new random graph
  const handleGenerateGraph = () => {
    // Ensure numEdges is not more than maximum possible edges
    const maxEdges = numNodes * (numNodes - 1);
    const actualNumEdges = Math.min(numEdges, maxEdges);

    // Generate the graph
    const { nodes: graphNodes, edges: graphEdges } = generateRandomGraph(
      numNodes,
      actualNumEdges,
      viewportWidth,
      viewportHeight,
      weighted
    );

    // Convert to ReactFlow format with improved styling
    const flowNodes: Node[] = graphNodes.map((node) => ({
      id: node.id,
      data: { label: node.label },
      position: node.position || { x: 0, y: 0 },
      style: nodeStyle,
      type: "default",
    }));

    const flowEdges: Edge[] = graphEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: "straight",
      animated: false,
      style: {
        stroke: "#555",
        strokeWidth: 2,
      },
      labelStyle: {
        fill: "#333",
        fontWeight: 700,
        fontSize: 14,
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.8,
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [4, 2],
      labelShowBg: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#555",
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  // Handle node changes (dragging, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Convert current graph to adjacency list format
  const getAdjacencyList = () => {
    const graph = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: String(n.data.label),
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label ? String(e.label) : undefined,
        weight:
          e.label && typeof e.label === "string"
            ? parseInt(e.label, 10)
            : undefined,
      })),
    };

    const adjList = toAdjacencyList(graph);

    // Convert to readable format
    let result = "";
    for (const [nodeId, neighbors] of adjList.entries()) {
      const node = graph.nodes.find((n) => n.id === nodeId);
      result += `${node?.label || nodeId}: [${neighbors
        .map((n) => {
          const neighborNode = graph.nodes.find((node) => node.id === n);
          return neighborNode?.label || n;
        })
        .join(", ")}]\n`;
    }

    return result;
  };

  // Convert current graph to adjacency matrix format
  const getAdjacencyMatrix = () => {
    const graph = {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: String(n.data.label),
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label ? String(e.label) : undefined,
        weight:
          e.label && typeof e.label === "string"
            ? parseInt(e.label, 10)
            : undefined,
      })),
    };

    const { matrix, nodeIds } = toAdjacencyMatrix(graph);

    // Get node labels instead of IDs
    const nodeLabels = nodeIds.map((id) => {
      const node = graph.nodes.find((n) => n.id === id);
      return node?.label || id;
    });

    // Create formatted matrix string
    let result = "  | " + nodeLabels.join(" | ") + " |\n";
    result += "-".repeat(result.length) + "\n";

    matrix.forEach((row, i) => {
      result += `${nodeLabels[i]} | ${row.join(" | ")} |\n`;
    });

    return result;
  };

  return (
    <div className="p-4 border rounded shadow mb-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">Graph Generator</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded">
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Nodes:
          </label>
          <input
            type="number"
            value={numNodes}
            onChange={(e) =>
              setNumNodes(Math.max(2, parseInt(e.target.value, 10) || 0))
            }
            min="2"
            max="20"
            className="border rounded px-2 py-1 text-black w-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Edges:
          </label>
          <input
            type="number"
            value={numEdges}
            onChange={(e) =>
              setNumEdges(Math.max(1, parseInt(e.target.value, 10) || 0))
            }
            min="1"
            className="border rounded px-2 py-1 text-black w-20"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={weighted}
              onChange={(e) => setWeighted(e.target.checked)}
              className="mr-2"
            />
            <span>Weighted</span>
          </label>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerateGraph}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
          >
            Generate Graph
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="border h-96 rounded mb-4 bg-gray-50 react-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          connectionLineType={ConnectionLineType.Straight}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={4}
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Graph Representations */}
      <div className="flex gap-4 mb-2">
        <button
          onClick={() => setShowAdjacencyList(!showAdjacencyList)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          {showAdjacencyList ? "Hide" : "Show"} Adjacency List
        </button>

        <button
          onClick={() => setShowAdjacencyMatrix(!showAdjacencyMatrix)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
        >
          {showAdjacencyMatrix ? "Hide" : "Show"} Adjacency Matrix
        </button>
      </div>

      {/* Display Adjacency List */}
      {showAdjacencyList && nodes.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="text-md font-medium mb-2">Adjacency List:</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {getAdjacencyList()}
          </pre>
        </div>
      )}

      {/* Display Adjacency Matrix */}
      {showAdjacencyMatrix && nodes.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="text-md font-medium mb-2">Adjacency Matrix:</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {getAdjacencyMatrix()}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GraphGenerator;
