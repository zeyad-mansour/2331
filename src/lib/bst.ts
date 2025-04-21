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
