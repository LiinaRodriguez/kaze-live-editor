import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomNode from './customNode';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange
} from '@xyflow/react';
import { parseToReactFlow } from '@liinarodriguez/kaze';
import { toPng } from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
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
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const parsedContent = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  const applyLayout = useCallback((nodes: Node[], edges: Edge[], layout: LayoutDirection): Node[] => {
    const spacingX = 200;
    const spacingY = 120;
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => nodeMap.set(node.id, { ...node, position: { x: 0, y: 0 } }));

    const childrenMap = new Map<string, string[]>();
    edges.forEach((edge) => {
      if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
      childrenMap.get(edge.source)!.push(edge.target);
    });

    let globalOffset = 0;
    const positionNode = (id: string, depth: number): number => {
      const children = childrenMap.get(id) || [];
      const childPositions = children.map((cid) => positionNode(cid, depth + 1));
      const avg = childPositions.length
        ? (Math.min(...childPositions) + Math.max(...childPositions)) / 2
        : globalOffset++;

      const node = nodeMap.get(id);
      if (node) {
        switch (layout) {
          case 'top-down':
            node.position = { x: avg * spacingX, y: depth * spacingY };
            node.sourcePosition = Position.Bottom;
            node.targetPosition = Position.Top;
            break;
          case 'bottom-up':
            node.position = { x: avg * spacingX, y: -depth * spacingY };
            node.sourcePosition = Position.Top;
            node.targetPosition = Position.Bottom;
            break;
          case 'left-right':
            node.position = { x: depth * spacingX, y: avg * spacingY };
            node.sourcePosition = Position.Right;
            node.targetPosition = Position.Left;
            break;
          case 'right-left':
            node.position = { x: -depth * spacingX, y: avg * spacingY };
            node.sourcePosition = Position.Left;
            node.targetPosition = Position.Right;
            break;
        }
      }
      return avg;
    };

    const targets = new Set(edges.map((e) => e.target));
    const roots = nodes.filter((n) => !targets.has(n.id));
    roots.forEach((r) => positionNode(r.id, 0));
    return Array.from(nodeMap.values());
  }, []);

  useEffect(() => {
    if (!content) {
      setNodes([]);
      setEdges([]);
      parsedContent.current = null;
      return;
    }

    try {
      const parsed = parseToReactFlow(content);

      if (!parsed || !parsed.nodes || !parsed.edges) {
        throw new Error('Error al parsear el contenido');
      }

      const nodesWithTypes = parsed.nodes.map(node => ({
        ...node,
        type: 'custom',
      }));

      if (nodesWithTypes.length > 0) {
        parsedContent.current = {
          nodes: nodesWithTypes,
          edges: parsed.edges
        };

        const positionedNodes = applyLayout(nodesWithTypes, parsed.edges, layout);
        setNodes(positionedNodes);

        const styledEdges = parsed.edges.map((edge) => ({
          ...edge,
          type: useCurvedEdges ? 'smoothstep' : 'straight',
          style: { stroke: '#6f6371', strokeWidth: 2 },
        }));
        setEdges(styledEdges);
      } else {
        throw new Error('No se encontraron nodos en el contenido');
      }
    } catch (error) {
      console.error('Error al procesar el contenido:', error);
      setNodes([]);
      setEdges([]);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el contenido', {
        duration: 4000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
        },
      });
      parsedContent.current = null;
    }
  }, [content, layout, useCurvedEdges, applyLayout]);

  useEffect(() => {
    if (parsedContent.current) {
      const { nodes: currentNodes, edges: currentEdges } = parsedContent.current;
      const positionedNodes = applyLayout(currentNodes, currentEdges, layout);
      setNodes(positionedNodes);

      const styledEdges = currentEdges.map((edge) => ({
        ...edge,
        type: useCurvedEdges ? 'smoothstep' : 'straight',
        style: { stroke: '#6f6371', strokeWidth: 2 },
      }));
      setEdges(styledEdges);
    }
  }, [layout, useCurvedEdges, applyLayout]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleExport = async () => {
    if (!reactFlowWrapper.current) return;

    try {
      const elementsToHide = reactFlowWrapper.current.querySelectorAll(
        '.react-flow__controls, .download-btn'
      );
      elementsToHide.forEach((el) => ((el as HTMLElement).style.opacity = '0'));

      const dataUrl = await toPng(reactFlowWrapper.current, {
        cacheBust: true,
        backgroundColor: 'white',
        filter: (node) => {
          return !(
            node.classList?.contains('react-flow__controls') ||
            node.classList?.contains('download-btn')
          );
        },
      });

      elementsToHide.forEach((el) => ((el as HTMLElement).style.opacity = '1'));

      const link = document.createElement('a');
      link.download = 'diagrama.png';
      link.href = dataUrl;
      link.click();

      toast.success('Imagen exportada correctamente', {
        duration: 3000,
        style: {
          background: '#dcfce7',
          color: '#166534',
        },
      });
    } catch (err) {
      console.error('Error al exportar imagen:', err);
      toast.error('Error al exportar la imagen', {
        duration: 4000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
        },
      });
    }
  };

  return (
    <div
      className="visualization-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      }}
      ref={reactFlowWrapper}
    >
      <button
        className="download-btn"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '6px 10px',
          cursor: 'pointer',
        }}
        onClick={handleExport}
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        style={{ backgroundColor: '#a5afbd33' }}
      >
        <Controls className="react-flow__controls" />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#6f6371" />
      </ReactFlow>
    </div>
  );
}