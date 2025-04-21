import React, { useMemo } from "react";
import { BSTNode } from "../../lib/bst";
import TreeNodeComponent from "./TreeNode";

interface TreeVisualizerProps {
  root: BSTNode | null;
  highlightedNodeValue?: number | null;
  width?: number;
  height?: number;
}

// Calculate positions for each node in the tree
const calculateNodePositions = (
  node: BSTNode | null,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number
): { node: BSTNode; x: number; y: number }[] => {
  if (!node) return [];

  const currentNodePosition = { node, x, y };

  // Left subtree positions with reduced horizontal spacing
  const leftPositions = calculateNodePositions(
    node.left,
    x - horizontalSpacing / 2,
    y + verticalSpacing,
    horizontalSpacing / 2,
    verticalSpacing
  );

  // Right subtree positions with reduced horizontal spacing
  const rightPositions = calculateNodePositions(
    node.right,
    x + horizontalSpacing / 2,
    y + verticalSpacing,
    horizontalSpacing / 2,
    verticalSpacing
  );

  return [currentNodePosition, ...leftPositions, ...rightPositions];
};

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  root,
  highlightedNodeValue = null,
  width = 600,
  height = 400,
}) => {
  const nodePositions = useMemo(() => {
    if (!root) return [];
    return calculateNodePositions(root, width / 2, 50, width / 4, 70);
  }, [root, width]);

  // Calculate edges between nodes
  const edges = useMemo(() => {
    const result: {
      from: { x: number; y: number };
      to: { x: number; y: number };
      fromNode: BSTNode;
      toNode: BSTNode;
    }[] = [];

    nodePositions.forEach((position) => {
      const { node, x, y } = position;

      if (node.left) {
        const leftNodePosition = nodePositions.find(
          (pos) => pos.node === node.left
        );
        if (leftNodePosition) {
          result.push({
            from: { x, y },
            to: { x: leftNodePosition.x, y: leftNodePosition.y },
            fromNode: node,
            toNode: node.left,
          });
        }
      }

      if (node.right) {
        const rightNodePosition = nodePositions.find(
          (pos) => pos.node === node.right
        );
        if (rightNodePosition) {
          result.push({
            from: { x, y },
            to: { x: rightNodePosition.x, y: rightNodePosition.y },
            fromNode: node,
            toNode: node.right,
          });
        }
      }
    });

    return result;
  }, [nodePositions]);

  if (!root) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Tree is empty</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <svg width={width} height={height}>
        {/* Draw edges first (so they appear behind nodes) */}
        {edges.map((edge, index) => (
          <line
            key={`edge-${index}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="#666"
            strokeWidth={2}
            className="transition-all duration-300"
          />
        ))}

        {/* Draw nodes */}
        {nodePositions.map((position, index) => (
          <foreignObject
            key={`node-${index}`}
            x={position.x - 20}
            y={position.y - 20}
            width={40}
            height={40}
          >
            <TreeNodeComponent
              node={position.node}
              isHighlighted={position.node.value === highlightedNodeValue}
            />
          </foreignObject>
        ))}
      </svg>
    </div>
  );
};

export default TreeVisualizer;
