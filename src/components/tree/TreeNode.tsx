import React from "react";
import { BSTNode } from "../../lib/bst"; // Adjust path as necessary

interface TreeNodeProps {
  node: BSTNode;
  isHighlighted?: boolean;
  // Add props for position (x, y), styling, event handlers etc.
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, isHighlighted = false }) => {
  // Base node styles
  let nodeClasses =
    "border rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm transition-all duration-300";

  // Apply different styling based on highlighted state
  if (isHighlighted) {
    nodeClasses +=
      " bg-blue-600 text-white border-blue-800 transform scale-110 shadow-md";
  } else {
    nodeClasses += " bg-blue-200 text-blue-800 border-blue-300";
  }

  return <div className={nodeClasses}>{node.value}</div>;
};

export default TreeNode;
