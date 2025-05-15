declare module 'kaze' {
  export type KazeNode = {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: { label: string; };
  }

  export type KazeEdge = {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
  }

  export function parseToReactFlow(sourceCode: string): {
    nodes: KazeNode[];
    edges: KazeEdge[];
  };
}
