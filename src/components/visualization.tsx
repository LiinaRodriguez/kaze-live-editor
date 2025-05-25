import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type Connection,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import type { Position } from '@xyflow/react';

import { parseToReactFlow } from '@liinarodriguez/kaze';
import '@xyflow/react/dist/style.css';

type LayoutDirection = 'top-down' | 'left-right' | 'right-left' | 'bottom-up';

type Props = {
  content: string;
  layout: LayoutDirection;
  useCurvedEdges: boolean;
};

export default function Visualization({ content, layout, useCurvedEdges }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    try {
      if (content) {
        const parsed = parseToReactFlow(content) as { nodes: Node[]; edges: Edge[] };

        const positionedNodes = applyLayout(parsed.nodes, parsed.edges, layout);
        setNodes(positionedNodes);

        const styledEdges = parsed.edges.map((edge) => ({
          ...edge,
          type: useCurvedEdges ? 'smoothstep' : 'straight',
        }));
        setEdges(styledEdges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Error al parsear contenido:', error);
      setNodes([]);
      setEdges([]);
    }
  }, [content, layout, useCurvedEdges]);

  const applyLayout = (nodes: Node[], edges: Edge[], layout: LayoutDirection): Node[] => {
    const spacingX = 200;
    const spacingY = 120;

    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, position: { x: 0, y: 0 } });
    });

    const childrenMap = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
    });

    let globalOffset = 0;

    const positionNode = (id: string, depth: number): number => {
      const children = childrenMap.get(id) || [];

      const childPositions: number[] = [];
      for (const childId of children) {
        const pos = positionNode(childId, depth + 1);
        childPositions.push(pos);
      }

      const avg = childPositions.length
        ? (Math.min(...childPositions) + Math.max(...childPositions)) / 2
        : globalOffset++;

      const node = nodeMap.get(id);
      if (node) {
        switch (layout) {
          case 'top-down':
            node.position = { x: avg * spacingX, y: depth * spacingY };
            node.sourcePosition = 'bottom' as Position;
            node.targetPosition = 'top' as Position;
            break;
          case 'bottom-up':
            node.position = { x: avg * spacingX, y: -depth * spacingY };
            node.sourcePosition = 'top' as Position;
            node.targetPosition = 'bottom' as Position;
            break;
          case 'left-right':
            node.position = { x: depth * spacingX, y: avg * spacingY };
            node.sourcePosition = 'right' as Position;
            node.targetPosition = 'left' as Position;
            break;
          case 'right-left':
            node.position = { x: -depth * spacingX, y: avg * spacingY };
            node.sourcePosition = 'left' as Position;
            node.targetPosition = 'right' as Position;
            break;
        }
      }

      return avg;
    };

    const targets = new Set(edges.map((e) => e.target));
    const roots = nodes.filter((n) => !targets.has(n.id));
    roots.forEach((r) => positionNode(r.id, 0));

    return Array.from(nodeMap.values());
  };

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
