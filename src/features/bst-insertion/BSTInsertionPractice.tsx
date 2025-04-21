import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ConnectionLineType,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { BSTNode, insert, generateRandomBST } from "../../lib/bst";

// --- Layout Constants ---
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 100;
const NODE_WIDTH = 60;
const NODE_HEIGHT = 60;

// --- Custom Components ---
const InsertionControls = ({
  valueToInsert,
  showFinalTree,
  handleValueChange,
  handleRandomize,
  handleShowAnswer,
  generateNewProblem,
  handleContinue,
}: {
  valueToInsert: number | null;
  showFinalTree: boolean;
  handleValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRandomize: () => void;
  handleShowAnswer: () => void;
  generateNewProblem: () => void;
  handleContinue: () => void;
}) => (
  <div className="flex flex-col gap-4 w-full mx-auto mb-4">
    <div className="flex flex-wrap gap-4 justify-center items-center p-4 rounded-lg bg-slate-800 shadow-lg">
      <button
        onClick={generateNewProblem}
        className="px-4 py-2 rounded-lg font-semibold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
      >
        Generate New Tree
      </button>

      {showFinalTree && (
        <button
          onClick={handleContinue}
          className="px-4 py-2 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md"
        >
          Continue with this tree
        </button>
      )}

      <div className="flex items-center gap-2">
        <label htmlFor="insertValue" className="font-medium text-gray-200">
          Value to Insert:
        </label>
        <input
          id="insertValue"
          type="number"
          min="1"
          max="100"
          value={valueToInsert || ""}
          onChange={handleValueChange}
          className="w-20 px-3 py-2 rounded-md bg-slate-900 text-white border border-indigo-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          disabled={showFinalTree}
        />
        <button
          onClick={handleRandomize}
          className="p-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          title="Generate random value"
          disabled={showFinalTree}
        >
          🎲
        </button>
      </div>

      <button
        onClick={handleShowAnswer}
        disabled={showFinalTree}
        className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all ${
          showFinalTree
            ? "bg-slate-600 text-slate-300 cursor-not-allowed opacity-60"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {showFinalTree ? "Result Shown" : "Show Result"}
      </button>
    </div>

    <div className="text-center text-white px-4 py-3 rounded-lg bg-slate-800 shadow-md">
      {showFinalTree ? (
        <span className="text-emerald-400">
          ✓ Value {valueToInsert} was inserted to the BST
        </span>
      ) : (
        <span>
          Try to determine where {valueToInsert} should be inserted in the tree
        </span>
      )}
    </div>
  </div>
);

// --- Layout Helper ---
// Calculates positions for nodes in a tree layout
function calculateLayout(
  node: BSTNode | null,
  level = 0,
  xOffset = 0,
  positions: Map<number, { x: number; y: number }> = new Map(),
  levelWidths: Map<number, number> = new Map()
): {
  positions: Map<number, { x: number; y: number }>;
  levelWidths: Map<number, number>;
  subtreeWidth: number;
} {
  if (!node) {
    return { positions, levelWidths, subtreeWidth: 0 };
  }

  // Base width for a single node
  const baseNodeWidth = NODE_WIDTH + 20; // Add some padding

  // For leaf nodes, return immediately with fixed width
  if (!node.left && !node.right) {
    const nodeY = level * VERTICAL_SPACING;
    positions.set(node.value, { x: xOffset, y: nodeY });

    // Update level width
    const currentLevelWidth = levelWidths.get(level) || 0;
    levelWidths.set(
      level,
      Math.max(currentLevelWidth, xOffset + baseNodeWidth)
    );

    return { positions, levelWidths, subtreeWidth: baseNodeWidth };
  }

  // Process left subtree
  const leftResult = calculateLayout(
    node.left,
    level + 1,
    xOffset,
    positions,
    levelWidths
  );

  // Process right subtree (positioned after left subtree)
  const rightOffset = xOffset + leftResult.subtreeWidth + HORIZONTAL_SPACING;
  const rightResult = calculateLayout(
    node.right,
    level + 1,
    rightOffset,
    leftResult.positions,
    leftResult.levelWidths
  );

  // Calculate width of current subtree
  const subtreeWidth =
    leftResult.subtreeWidth +
    (node.left && node.right ? HORIZONTAL_SPACING : 0) +
    rightResult.subtreeWidth;

  // Calculate x position for current node (centered above children)
  let nodeX;

  if (node.left && node.right) {
    // If both children exist, center between them
    const leftChildX = positions.get(node.left.value)!.x;
    const rightChildX = positions.get(node.right.value)!.x;
    nodeX = (leftChildX + rightChildX) / 2;
  } else if (node.left) {
    // If only left child exists, position above it plus an offset
    const leftChildX = positions.get(node.left.value)!.x;
    nodeX = leftChildX + NODE_WIDTH / 2;
  } else if (node.right) {
    // If only right child exists, position above it minus an offset
    const rightChildX = positions.get(node.right.value)!.x;
    nodeX = rightChildX - NODE_WIDTH / 2;
  } else {
    // No children (should not reach here due to leaf node check above)
    nodeX = xOffset + subtreeWidth / 2 - NODE_WIDTH / 2;
  }

  // Calculate y position based on level
  const nodeY = level * VERTICAL_SPACING;

  // Store position
  positions.set(node.value, { x: nodeX, y: nodeY });

  // Update level width
  const currentLevelWidth = levelWidths.get(level) || 0;
  levelWidths.set(level, Math.max(currentLevelWidth, nodeX + NODE_WIDTH));

  return {
    positions,
    levelWidths,
    subtreeWidth: Math.max(subtreeWidth, baseNodeWidth),
  };
}

// --- Conversion Helper ---
// Converts BST structure to ReactFlow nodes and edges
function convertBSTtoFlow(
  bstRoot: BSTNode | null,
  highlightValue: number | null = null
): { nodes: Node[]; edges: Edge[] } {
  if (!bstRoot) {
    return { nodes: [], edges: [] };
  }

  const { positions } = calculateLayout(bstRoot);
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];
  const queue: (BSTNode | null)[] = [bstRoot];
  const visitedValues = new Set<number>(); // Keep track of processed nodes

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || visitedValues.has(node.value)) {
      continue;
    }
    visitedValues.add(node.value);

    const pos = positions.get(node.value) || { x: 0, y: 0 }; // Fallback position
    const isHighlighted = highlightValue === node.value;

    // Create node with conditional highlighting
    flowNodes.push({
      id: String(node.value),
      data: { label: String(node.value) },
      position: pos,
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold",
        backgroundColor: isHighlighted ? "#ec4899" : "#4f46e5",
        color: "#ffffff",
        border: `2px solid ${isHighlighted ? "#be185d" : "#4338ca"}`,
        boxShadow: isHighlighted
          ? "0 0 15px #ec4899"
          : "0 4px 6px rgba(0, 0, 0, 0.3)",
        zIndex: 10, // Ensure nodes appear above edges
      },
      type: "default",
    });

    // Create edges and add children to queue
    if (node.left) {
      flowEdges.push({
        id: `e-${node.value}-l-${node.left.value}`,
        source: String(node.value),
        target: String(node.left.value),
        type: "straight",
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#94a3b8",
        },
      });
      queue.push(node.left);
    }
    if (node.right) {
      flowEdges.push({
        id: `e-${node.value}-r-${node.right.value}`,
        source: String(node.value),
        target: String(node.right.value),
        type: "straight",
        style: {
          stroke: "#94a3b8",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#94a3b8",
        },
      });
      queue.push(node.right);
    }
  }

  return { nodes: flowNodes, edges: flowEdges };
}

// --- Main Component ---
const BSTInsertionPractice: React.FC = () => {
  const [bstRoot, setBstRoot] = useState<BSTNode | null>(null);
  const [valueToInsert, setValueToInsert] = useState<number | null>(null);
  const [showFinalTree, setShowFinalTree] = useState<boolean>(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [existingValues, setExistingValues] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [insertionHistory, setInsertionHistory] = useState<number[]>([]); // Track insertion history

  // Generate a new random value not in the tree
  const generateRandomValue = useCallback(() => {
    try {
      let newValue;
      do {
        newValue = Math.floor(Math.random() * 50) + 1;
      } while (existingValues.has(newValue));

      setValueToInsert(newValue);
      setShowFinalTree(false);
    } catch (err) {
      setError("Error generating random value: " + String(err));
    }
  }, [existingValues]);

  // Continue with the current tree but insert a new value
  const handleContinue = useCallback(() => {
    // Keep the current tree but prepare for a new insertion
    setShowFinalTree(false);

    // Add the current insertion to history
    if (valueToInsert !== null) {
      setInsertionHistory((prev) => [...prev, valueToInsert]);
    }

    // Generate a new random value to insert
    try {
      let newValue;
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loop

      do {
        newValue = Math.floor(Math.random() * 50) + 1;
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error(
            "Unable to find an unused value after multiple attempts"
          );
        }
      } while (existingValues.has(newValue));

      setValueToInsert(newValue);
    } catch (err) {
      setError("Error generating next value: " + String(err));
    }
  }, [valueToInsert, existingValues]);

  const generateNewProblem = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate a smaller tree for better visibility
      const size = 5;
      const newBst = generateRandomBST(size, 1, 50);

      // Debug log
      console.log("Generated BST:", JSON.stringify(newBst, null, 2));

      if (!newBst) {
        setError("Failed to generate BST - tree is null");
        setIsLoading(false);
        return;
      }

      setBstRoot(newBst);

      // Collect existing values in the tree
      const values = new Set<number>();
      function traverse(node: BSTNode | null) {
        if (!node) return;
        values.add(node.value);
        traverse(node.left);
        traverse(node.right);
      }
      traverse(newBst);
      setExistingValues(values);

      // Convert initial tree to flow elements
      const { nodes: initialNodes, edges: initialEdges } =
        convertBSTtoFlow(newBst);

      // Debug log for nodes and edges
      console.log("Flow nodes:", initialNodes.length, initialNodes);
      console.log("Flow edges:", initialEdges.length, initialEdges);

      if (initialNodes.length === 0) {
        setError("Generated BST has no nodes - check conversion logic");
        setIsLoading(false);
        return;
      }

      setNodes(initialNodes);
      setEdges(initialEdges);

      // Generate random insertion value
      let newValue;
      do {
        newValue = Math.floor(Math.random() * 50) + 1;
      } while (values.has(newValue));

      setValueToInsert(newValue);
      setShowFinalTree(false);
      setIsLoading(false);

      // Reset insertion history
      setInsertionHistory([]);
    } catch (err) {
      console.error("Error generating tree:", err);
      setError("Error generating tree: " + String(err));
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  // Handle manual change of value to insert
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setValueToInsert(value);
      setShowFinalTree(false);
    }
  };

  const handleShowAnswer = () => {
    if (!bstRoot || valueToInsert === null) return;

    try {
      // Skip if the value already exists in the tree
      if (existingValues.has(valueToInsert)) {
        alert(
          `Value ${valueToInsert} already exists in the tree. Please choose a different value.`
        );
        return;
      }

      // Create a deep copy before inserting
      const deepCopy = JSON.parse(JSON.stringify(bstRoot));
      const finalBst = insert(deepCopy, valueToInsert);

      // Update the root for consecutive insertions
      setBstRoot(finalBst);

      // Update the set of existing values
      const newExistingValues = new Set(existingValues);
      newExistingValues.add(valueToInsert);
      setExistingValues(newExistingValues);

      // Convert to flow with highlighting the newly inserted node
      const { nodes: finalNodes, edges: finalEdges } = convertBSTtoFlow(
        finalBst,
        valueToInsert
      );
      setNodes(finalNodes);
      setEdges(finalEdges);
      setShowFinalTree(true);
    } catch (err) {
      setError("Error showing answer: " + String(err));
    }
  };

  // Generate initial problem on mount
  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-2xl p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
        Binary Search Tree Insertion Practice
      </h1>

      {/* Upcoming features notice */}
      <div className="mb-3 text-right">
        <span className="text-xs text-slate-400">
          Coming soon: BST Rotations
        </span>
      </div>

      {/* Error and loading states */}
      {error && (
        <div className="p-2 bg-red-500 text-white rounded mb-2">{error}</div>
      )}
      {isLoading && (
        <div className="p-2 bg-indigo-700 text-white rounded mb-2">
          Generating tree...
        </div>
      )}

      {/* History display */}
      {insertionHistory.length > 0 && (
        <div className="mb-4 p-3 text-white bg-indigo-900/50 rounded-lg shadow-inner">
          <p className="font-medium mb-1">Insertion History:</p>
          <div className="flex flex-wrap gap-2">
            {insertionHistory.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full font-bold text-white"
                title={`Insertion #${index + 1}`}
              >
                {value}
              </span>
            ))}
            {valueToInsert !== null && showFinalTree && (
              <span className="inline-flex items-center justify-center w-8 h-8 bg-pink-600 rounded-full font-bold text-white animate-pulse">
                {valueToInsert}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 text-slate-300">
            Trees grow by inserting one node at a time. Each value above has
            been inserted in sequence.
          </p>
        </div>
      )}

      {/* Node count indicator */}
      <div className="mb-2 text-slate-300 text-sm">
        Tree has {nodes.length} nodes and {edges.length} edges
      </div>

      {/* Controls */}
      <InsertionControls
        valueToInsert={valueToInsert}
        showFinalTree={showFinalTree}
        handleValueChange={handleValueChange}
        handleRandomize={generateRandomValue}
        handleShowAnswer={handleShowAnswer}
        generateNewProblem={generateNewProblem}
        handleContinue={handleContinue}
      />

      {/* React Flow Visualization */}
      <div
        className="flex-grow rounded-lg overflow-hidden react-flow-container border border-slate-700 shadow-inner"
        style={{ minHeight: "400px", height: "60vh", maxHeight: "700px" }}
      >
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.5, includeHiddenNodes: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            connectionLineType={ConnectionLineType.Straight}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            className="bg-slate-900"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(148, 163, 184, 0.1)"
            />
            <Controls
              showInteractive={false}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Panel
              position="top-right"
              className="bg-slate-800 px-3 py-2 rounded-md text-white bg-opacity-80 shadow-md"
            >
              <p className="text-sm font-medium">
                Hint: BST nodes are arranged with
              </p>
              <p className="text-sm">
                <span className="text-indigo-400">smaller values</span> to the
                left
              </p>
              <p className="text-sm">
                <span className="text-pink-400">larger values</span> to the
                right
              </p>
            </Panel>
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-900 text-slate-300">
            No nodes to display. Try generating a new tree.
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with ReactFlowProvider
const BSTInsertionPracticeWrapper: React.FC = () => {
  // Error boundary
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Runtime error:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-600 text-white rounded-lg shadow-lg">
        <h3 className="text-xl font-bold">Something went wrong!</h3>
        <p>There was an error rendering the BST component.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-white text-red-600 font-bold rounded"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <BSTInsertionPractice />
    </ReactFlowProvider>
  );
};

export default BSTInsertionPracticeWrapper;
