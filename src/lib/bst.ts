// Define the structure for a BST node
export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

// Function to insert a value into a BST
export function insert(root: BSTNode | null, value: number): BSTNode {
  // If the tree is empty, return a new node
  if (!root) {
    return { value, left: null, right: null };
  }

  // Otherwise, recur down the tree
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else if (value > root.value) {
    // Avoid inserting duplicates for simplicity, or handle as needed
    root.right = insert(root.right, value);
  }

  // Return the (unchanged) node pointer
  return root;
}

// Helper function to generate a random integer within a range
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random BST
export function generateRandomBST(
  size: number,
  minVal = 1,
  maxVal = 100
): BSTNode | null {
  if (size <= 0) {
    return null;
  }

  let root: BSTNode | null = null;
  const usedValues = new Set<number>();

  for (let i = 0; i < size; i++) {
    let value;
    // Ensure unique values
    do {
      value = getRandomInt(minVal, maxVal);
    } while (usedValues.has(value));

    usedValues.add(value);
    root = insert(root, value);
  }

  return root;
}

// Find a node with given value in BST
export function findNode(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  if (root.value === value) return root;
  return value < root.value
    ? findNode(root.left, value)
    : findNode(root.right, value);
}

// Deep clone a BST
export function cloneTree(root: BSTNode | null): BSTNode | null {
  if (!root) return null;
  return {
    value: root.value,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
  };
}

// Check if left/right rotation is possible on a node
export function canRotateLeft(node: BSTNode): boolean {
  return node.right !== null;
}
export function canRotateRight(node: BSTNode): boolean {
  return node.left !== null;
}

// Perform left rotation at pivot value
export function rotateLeft(
  root: BSTNode | null,
  pivotValue: number
): BSTNode | null {
  if (!root) return null;
  if (root.value === pivotValue) {
    if (!root.right) return root;
    const newRoot = root.right;
    root.right = newRoot.left;
    newRoot.left = root;
    return newRoot;
  }
  if (pivotValue < root.value) {
    root.left = rotateLeft(root.left, pivotValue);
  } else {
    root.right = rotateLeft(root.right, pivotValue);
  }
  return root;
}

// Perform right rotation at pivot value
export function rotateRight(
  root: BSTNode | null,
  pivotValue: number
): BSTNode | null {
  if (!root) return null;
  if (root.value === pivotValue) {
    if (!root.left) return root;
    const newRoot = root.left;
    root.left = newRoot.right;
    newRoot.right = root;
    return newRoot;
  }
  if (pivotValue < root.value) {
    root.left = rotateRight(root.left, pivotValue);
  } else {
    root.right = rotateRight(root.right, pivotValue);
  }
  return root;
}

// Type representing a rotation step for visualization
export interface RotationStep {
  type: "before" | "after" | "invalid";
  description: string;
  pivotValue: number | null;
}

// Generate steps describing the rotation process
export function getRotationSteps(
  root: BSTNode | null,
  pivotValue: number,
  rotationType: "left" | "right"
): RotationStep[] {
  const node = findNode(root, pivotValue);
  if (!node) {
    return [
      {
        type: "invalid",
        description: `Node ${pivotValue} not found`,
        pivotValue: null,
      },
    ];
  }
  if (
    (rotationType === "left" && !canRotateLeft(node)) ||
    (rotationType === "right" && !canRotateRight(node))
  ) {
    return [
      {
        type: "invalid",
        description: `Cannot ${rotationType} rotate at node ${pivotValue}`,
        pivotValue: null,
      },
    ];
  }
  return [
    {
      type: "before",
      description: `About to ${rotationType} rotate at node ${pivotValue}`,
      pivotValue,
    },
    {
      type: "after",
      description: `${
        rotationType.charAt(0).toUpperCase() + rotationType.slice(1)
      } rotation at node ${pivotValue} completed`,
      pivotValue,
    },
  ];
}

// Apply the rotation to the tree
export function applyRotation(
  root: BSTNode | null,
  pivotValue: number,
  rotationType: "left" | "right"
): BSTNode | null {
  return rotationType === "left"
    ? rotateLeft(root, pivotValue)
    : rotateRight(root, pivotValue);
}
