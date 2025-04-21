import React, { useState, useEffect, useCallback } from "react";
// import { insert, rotateLeft, rotateRight, getRotationSteps } from "../../lib/bst";
import {
  BSTNode,
  findNode,
  canRotateLeft,
  canRotateRight,
  applyRotation,
  cloneTree,
  generateRandomBST,
} from "../../lib/bst";
import ReactFlow, {
  Controls,
  Background,
  Panel,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ConnectionLineType,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { convertBSTtoFlow } from "../bst-insertion/BSTInsertionPractice";

// Note: rotation uses the same layout helper from insertion for consistent spacing

const BSTRotationPractice: React.FC = () => {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [root, setRoot] = useState<BSTNode | null>(null);
  const [selectedNodeValue, setSelectedNodeValue] = useState<number | null>(
    null
  );
  const [rotationType, setRotationType] = useState<"left" | "right">("left");
  const [message, setMessage] = useState<string>("");
  const [existingValues, setExistingValues] = useState<Set<number>>(new Set());
  const [nodeCount, setNodeCount] = useState<number>(5);

  // Generate a new random BST
  const generateNewTree = useCallback(() => {
    const newTree = generateRandomBST(nodeCount, 1, 50);
    setRoot(newTree);
    // collect values
    const vals = new Set<number>();
    function traverse(node: BSTNode | null) {
      if (!node) return;
      vals.add(node.value);
      traverse(node.left);
      traverse(node.right);
    }
    traverse(newTree);
    setExistingValues(vals);
    setSelectedNodeValue(null);
    setMessage("");
  }, [nodeCount]);
  useEffect(() => {
    generateNewTree();
  }, [generateNewTree]);

  // Click handler for nodes in React Flow
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const clickedValue = parseInt(node.id, 10);
    if (!isNaN(clickedValue)) {
      setSelectedNodeValue(clickedValue);
      setMessage(`Selected node ${clickedValue} for rotation.`);
    }
  }, []);

  // Update ReactFlow when tree or selection changes
  useEffect(() => {
    if (!root) return;
    const { nodes: flowNodes, edges: flowEdges } = convertBSTtoFlow(
      root,
      selectedNodeValue
    );
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [root, selectedNodeValue]);

  // Handle node selection for rotation
  const handleNodeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setSelectedNodeValue(value);

      // Check if the selected node exists
      const node = findNode(root, value);
      if (!node) {
        setMessage(`Node with value ${value} not found`);
        return;
      }

      setMessage(`Selected node ${value}`);
    }
  };

  // Handle rotation type selection
  const handleRotationTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRotationType(event.target.value as "left" | "right");
  };

  // Start rotation animation
  const handleRotate = () => {
    if (!root || selectedNodeValue === null) {
      setMessage("Please select a node first");
      return;
    }

    // Find the node in the current tree state to check rotation possibility
    const nodeToRotate = findNode(root, selectedNodeValue);
    if (!nodeToRotate) {
      setMessage(`Node ${selectedNodeValue} not found in the current tree.`); // Should not happen if UI is synced
      return;
    }

    const canPerformRotation =
      rotationType === "left"
        ? canRotateLeft(nodeToRotate)
        : canRotateRight(nodeToRotate);

    if (!canPerformRotation) {
      setMessage(
        `Cannot perform ${rotationType} rotation at node ${selectedNodeValue}.`
      );
      return;
    }

    // --- Ensure Immutability ---
    // Clone the tree *before* rotating
    const clonedRoot = cloneTree(root);
    if (!clonedRoot) {
      setMessage("Error: Failed to prepare tree for rotation.");
      return;
    }

    // Apply rotation to the *cloned* tree
    const newRotatedRoot = applyRotation(
      clonedRoot,
      selectedNodeValue,
      rotationType
    );

    // Update the main root state with the new, rotated tree structure
    setRoot(newRotatedRoot); // This will trigger the useEffect to update ReactFlow

    setMessage(
      `${
        rotationType.charAt(0).toUpperCase() + rotationType.slice(1)
      } rotation at node ${selectedNodeValue} completed`
    );
  };

  // Determine if a rotation can be performed
  const canRotate = () => {
    if (!root || selectedNodeValue === null) return false;

    const selectedNode = findNode(root, selectedNodeValue);
    if (!selectedNode) return false;

    return rotationType === "left"
      ? canRotateLeft(selectedNode)
      : canRotateRight(selectedNode);
  };

  // Check if rotation controls should be disabled
  const isRotationDisabled = !canRotate();

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl shadow-2xl p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
        Binary Search Tree Rotation Practice
      </h1>

      <div className="flex flex-col gap-4 w-full mx-auto mb-4">
        <div className="flex flex-wrap gap-4 justify-center items-center p-4 rounded-lg bg-slate-700 shadow-lg">
          <div className="flex items-center gap-2">
            <label htmlFor="nodeCount" className="font-medium text-gray-200">
              Nodes: {nodeCount}
            </label>
            <input
              id="nodeCount"
              type="range"
              min={1}
              max={20}
              value={nodeCount}
              onChange={(e) => setNodeCount(parseInt(e.target.value, 10))}
              className="w-32"
            />
          </div>
          <button
            onClick={generateNewTree}
            className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            Generate New Tree
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="selectNode" className="font-medium text-gray-200">
              Node to Rotate:
            </label>
            <select
              id="selectNode"
              value={selectedNodeValue || ""}
              onChange={handleNodeSelect}
              className="px-3 py-2 rounded-md bg-slate-900 text-white border border-indigo-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="">Select Node</option>
              {Array.from(existingValues)
                .sort((a, b) => a - b)
                .map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rotationType" className="font-medium text-gray-200">
              Rotation:
            </label>
            <select
              id="rotationType"
              value={rotationType}
              onChange={handleRotationTypeChange}
              className="px-3 py-2 rounded-md bg-slate-900 text-white border border-indigo-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <button
            onClick={handleRotate}
            disabled={isRotationDisabled}
            className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all ${
              canRotate()
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-600 text-slate-300 cursor-not-allowed opacity-60"
            }`}
          >
            {rotationType === "left" ? "Rotate Left" : "Rotate Right"}
          </button>
        </div>
      </div>

      {/* Error and status message */}
      {message && (
        <div className="p-2 bg-pink-600 text-white rounded mb-2 text-center">
          {message}
        </div>
      )}

      {/* Removed multi-step controls; rotation happens immediately */}

      {/* React Flow Visualization */}
      <div
        className="flex-grow rounded-lg overflow-hidden react-flow-container border border-slate-700 shadow-inner"
        style={{ minHeight: "400px", height: "60vh", maxHeight: "700px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
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
            className="bg-slate-800 px-4 py-3 rounded-md text-white bg-opacity-80 shadow-md space-y-2"
          >
            <p className="text-sm font-semibold">Rotation Hint</p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Left Rotate</strong> at node <em>P</em>:
                <br />
                &nbsp;&nbsp;let <em>R = P.right</em>;
                <br />
                &nbsp;&nbsp;<em>P.right = R.left</em>;
                <br />
                &nbsp;&nbsp;<em>R.left = P</em>;
                <br />
                &nbsp;&nbsp;return <em>R</em> as the new root of this subtree.
              </p>
              <p>
                <strong>Right Rotate</strong> at node <em>P</em>:
                <br />
                &nbsp;&nbsp;let <em>L = P.left</em>;
                <br />
                &nbsp;&nbsp;<em>P.left = L.right</em>;
                <br />
                &nbsp;&nbsp;<em>L.right = P</em>;
                <br />
                &nbsp;&nbsp;return <em>L</em> as the new root of this subtree.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Rotations preserve in-order traversal and help balance the tree
              locally.
            </p>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <BSTRotationPractice />
  </ReactFlowProvider>
);
