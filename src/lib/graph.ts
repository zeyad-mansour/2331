// Define the graph node interface
export interface GraphNode {
  id: string;
  label: string;
  position?: { x: number; y: number };
}

// Define the graph edge interface
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

// Define the graph interface
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Helper function to create a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate a random position within a given area
export function generateRandomPosition(
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

// Generate positions in a circular layout
export function generateCircularLayout(
  numNodes: number,
  width: number,
  height: number,
  radius?: number
): { x: number; y: number }[] {
  // Use 80% of the smaller dimension as the radius
  const effectiveRadius = radius || Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;

  const positions: { x: number; y: number }[] = [];

  // Calculate positions evenly spaced around the circle
  for (let i = 0; i < numNodes; i++) {
    // Calculate angle (in radians) for this node
    const angle = (i * 2 * Math.PI) / numNodes;

    // Convert polar coordinates to Cartesian
    const x = centerX + effectiveRadius * Math.cos(angle);
    const y = centerY + effectiveRadius * Math.sin(angle);

    positions.push({ x, y });
  }

  return positions;
}

// Generate a random graph with specified number of nodes and edges
export function generateRandomGraph(
  numNodes: number,
  numEdges: number,
  width: number = 800,
  height: number = 600,
  weighted: boolean = false
): Graph {
  // Create nodes with positions in a circular layout
  const positions = generateCircularLayout(numNodes, width, height);

  const nodes: GraphNode[] = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      id: `node-${i + 1}`,
      label: `${i + 1}`,
      position: positions[i],
    });
  }

  // Create edges
  const edges: GraphEdge[] = [];

  // Simple approach: randomly connect nodes until we reach the desired number of edges
  // Note: This is a simple approach that may generate parallel edges or self-loops
  const possibleEdges: [string, string][] = [];

  // Generate all possible edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) {
        // Avoid self-loops
        possibleEdges.push([nodes[i].id, nodes[j].id]);
      }
    }
  }

  // Shuffle possible edges
  shuffleArray(possibleEdges);

  // Take as many edges as requested
  const selectedEdges = possibleEdges.slice(0, numEdges);

  // Create edge objects
  selectedEdges.forEach(([source, target], index) => {
    const weight = weighted ? Math.floor(Math.random() * 10) + 1 : undefined;
    edges.push({
      id: `edge-${index + 1}`,
      source,
      target,
      weight,
      label: weight?.toString(),
    });
  });

  return { nodes, edges };
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Convert Graph to adjacency list representation
export function toAdjacencyList(graph: Graph): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();

  // Initialize adjacency list for all nodes
  graph.nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  // Add edges to adjacency list
  graph.edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  return adjacencyList;
}

// Convert Graph to adjacency matrix representation
export function toAdjacencyMatrix(graph: Graph): {
  matrix: number[][];
  nodeIds: string[];
} {
  const nodeIds = graph.nodes.map((node) => node.id);
  const size = nodeIds.length;

  // Initialize empty matrix
  const matrix: number[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0));

  // Create a mapping from node id to index
  const nodeIdToIndex = new Map<string, number>();
  nodeIds.forEach((id, index) => {
    nodeIdToIndex.set(id, index);
  });

  // Fill matrix with edge weights (or 1 for unweighted graphs)
  graph.edges.forEach((edge) => {
    const sourceIndex = nodeIdToIndex.get(edge.source);
    const targetIndex = nodeIdToIndex.get(edge.target);

    if (sourceIndex !== undefined && targetIndex !== undefined) {
      matrix[sourceIndex][targetIndex] = edge.weight || 1;
    }
  });

  return { matrix, nodeIds };
}
