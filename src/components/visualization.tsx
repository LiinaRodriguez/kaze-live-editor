
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
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { parseToReactFlow } from '@liinarodriguez/kaze';
import { toPng } from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import '@xyflow/react/dist/style.css';

type LayoutDirection = 'top-down' | 'left-right' | 'right-left' | 'bottom-up';

type Props = {
  content: string;
  layout: LayoutDirection;
  useCurvedEdges: boolean;
};

function isValidSyntax(content: string): string | null {
  try {
    parseToReactFlow(content); // Intenta parsear el contenido
    return null; // Si no lanza error, no hay problema
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error de sintaxis detectado:', error);
      return error.message; // Devuelve el mensaje del error
    }
    console.error('Error de sintaxis desconocido:', error);
    return 'Error desconocido'; // Mensaje genérico para errores desconocidos
  }
}

export default function Visualization({ content, layout, useCurvedEdges }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);


  useEffect(() => {
    try {
      const syntaxError = isValidSyntax(content);
      console.log(content)
      if (content && !syntaxError) {
        const parsed = parseToReactFlow(content) as { nodes: Node[]; edges: Edge[] };
        const nodesWithTypes = parsed.nodes.map(node => ({
          ...node,
          type: 'custom',
        }));
        const positionedNodes = applyLayout(nodesWithTypes, parsed.edges, layout);

        setNodes(positionedNodes);

        const styledEdges = parsed.edges.map((edge) => ({
          ...edge,
          type: useCurvedEdges ? 'smoothstep' : 'straight',
          style: {
            stroke: '#555',
            strokeWidth: 2,
          },
          // Eliminamos markerEnd para quitar las flechas
        }));
        setEdges(styledEdges);
        setError(null); // Limpia el error si todo está bien
      } else {
        setNodes([]);
        setEdges([]);
        setError(syntaxError || 'El contenido tiene una sintaxis inválida.'); // Establece un mensaje de error
      }
    } catch (error) {
      console.error('Error al parsear contenido:', error);
      setNodes([]);
      setEdges([]);
      setError('Error al parsear contenido. Verifica la sintaxis.'); // Establece un mensaje de error
    }
  }, [content, layout, useCurvedEdges]);

  const applyLayout = (nodes: Node[], edges: Edge[], layout: LayoutDirection): Node[] => {
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
    } catch (err) {
      console.error('Error al exportar imagen:', err);
    }
  };

  return (
    <>
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
        style={{ backgroundColor: 'white' }}
      >
        <Controls className="react-flow__controls" />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
        <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
           {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        </div>
      </div>
      </>
  );
}