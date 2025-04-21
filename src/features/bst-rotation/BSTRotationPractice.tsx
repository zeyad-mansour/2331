import React, { useState } from "react";
import {
  BSTNode,
  insert,
  rotateLeft,
  rotateRight,
  findNode,
  canRotateLeft,
  canRotateRight,
  getRotationSteps,
  applyRotation,
  cloneTree,
  RotationStep,
} from "../../lib/bst";
import TreeVisualizer from "../../components/tree/TreeVisualizer";

const BSTRotationPractice: React.FC = () => {
  const [root, setRoot] = useState<BSTNode | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedNodeValue, setSelectedNodeValue] = useState<number | null>(
    null
  );
  const [rotationSteps, setRotationSteps] = useState<RotationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [rotationType, setRotationType] = useState<"left" | "right">("left");
  const [treeBeforeRotation, setTreeBeforeRotation] = useState<BSTNode | null>(
    null
  );
  const [message, setMessage] = useState<string>("");

  // Handle addition of new nodes to the tree
  const handleAddNode = () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      setMessage("Please enter a valid number");
      return;
    }

    // Check if the node already exists
    if (findNode(root, value)) {
      setMessage(`Node with value ${value} already exists`);
      return;
    }

    // Reset any ongoing rotation
    resetRotation();

    // Insert the new node
    const newRoot = insert(root, value);
    setRoot(newRoot);
    setInputValue("");
    setMessage(`Added node with value ${value}`);
  };

  // Handle node selection for rotation
  const handleNodeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setSelectedNodeValue(value);

      // Reset any ongoing rotation
      resetRotation();

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
    resetRotation();
  };

  // Start rotation animation
  const handleRotate = () => {
    if (!root || selectedNodeValue === null) {
      setMessage("Please select a node first");
      return;
    }

    // Get steps for the rotation
    const steps = getRotationSteps(root, selectedNodeValue, rotationType);

    // Check if rotation is invalid
    if (steps.length === 1 && steps[0].type === "invalid") {
      setMessage(steps[0].description);
      return;
    }

    // Save the current tree state for before/after comparison
    setTreeBeforeRotation(cloneTree(root));

    // Set up the rotation
    setRotationSteps(steps);
    setCurrentStepIndex(0);
    setMessage(steps[0].description);
  };

  // Handle next step in rotation
  const handleNextStep = () => {
    if (currentStepIndex < rotationSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setMessage(rotationSteps[nextIndex].description);

      // If this is the "after" step, apply the rotation
      if (rotationSteps[nextIndex].type === "after" && treeBeforeRotation) {
        const pivotValue = rotationSteps[nextIndex].pivotValue;
        if (pivotValue !== null) {
          const newRoot = applyRotation(root, pivotValue, rotationType);
          if (newRoot) {
            setRoot(newRoot);
          }
        }
      }
    }
  };

  // Handle previous step in rotation
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setMessage(rotationSteps[prevIndex].description);

      // If going back from "after" to "before", restore the original tree
      if (
        rotationSteps[currentStepIndex].type === "after" &&
        rotationSteps[prevIndex].type === "before" &&
        treeBeforeRotation
      ) {
        setRoot(cloneTree(treeBeforeRotation));
      }
    }
  };

  // Reset the rotation state
  const resetRotation = () => {
    setRotationSteps([]);
    setCurrentStepIndex(-1);
    setTreeBeforeRotation(null);
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
  const isRotationDisabled = rotationSteps.length > 0 || !canRotate();

  // Determine which tree to show
  const treeToDisplay = root;

  // Generate a sample array of selectable node values
  const nodeValues = React.useMemo(() => {
    const collectValues = (
      node: BSTNode | null,
      values: number[] = []
    ): number[] => {
      if (!node) return values;
      values.push(node.value);
      collectValues(node.left, values);
      collectValues(node.right, values);
      return values;
    };

    return collectValues(root).sort((a, b) => a - b);
  }, [root]);

  return (
    <div className="p-4 border rounded shadow mt-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">BST Rotation Practice</h2>

      {/* Node Insertion Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h3 className="text-md font-medium mb-2">Add Nodes to Tree</h3>
        <div className="flex space-x-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="border px-2 py-1 rounded w-32 text-black"
          />
          <button
            onClick={handleAddNode}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
          >
            Add Node
          </button>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="border h-64 bg-gray-50 rounded mb-4 overflow-hidden">
        <TreeVisualizer
          root={treeToDisplay}
          highlightedNodeValue={selectedNodeValue}
          width={600}
          height={250}
        />
      </div>

      {/* Rotation Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h3 className="text-md font-medium mb-2">Rotation Controls</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex items-center">
            <label className="mr-2">Node:</label>
            <select
              value={selectedNodeValue || ""}
              onChange={handleNodeSelect}
              className="border px-2 py-1 rounded text-black"
              disabled={rotationSteps.length > 0}
            >
              <option value="">Select Node</option>
              {nodeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center ml-4">
            <label className="mr-2">Rotation:</label>
            <select
              value={rotationType}
              onChange={handleRotationTypeChange}
              className="border px-2 py-1 rounded text-black"
              disabled={rotationSteps.length > 0}
            >
              <option value="left">Left Rotation</option>
              <option value="right">Right Rotation</option>
            </select>
          </div>

          <button
            onClick={handleRotate}
            disabled={isRotationDisabled}
            className={`ml-4 font-bold py-1 px-3 rounded ${
              isRotationDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            Rotate
          </button>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-gray-50 p-3 rounded mb-3 min-h-[2rem]">
        <p className="text-gray-700">{message}</p>
      </div>

      {/* Navigation Controls */}
      {rotationSteps.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {rotationSteps.length}
          </p>
          <div>
            <button
              onClick={handlePreviousStep}
              disabled={currentStepIndex <= 0}
              className={`py-1 px-3 rounded mr-2 ${
                currentStepIndex <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex >= rotationSteps.length - 1}
              className={`py-1 px-3 rounded ${
                currentStepIndex >= rotationSteps.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BSTRotationPractice;
