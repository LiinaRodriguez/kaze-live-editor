import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import { parseToReactFlow } from '@liinarodriguez/kaze';
import '@xyflow/react/dist/style.css';

type Props = {
  content: string,
}

export default function Visualization({ content }: Props) {
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    try {
      if (content) { 
        const parsed = parseToReactFlow(content);
       
        setNodes(parsed.nodes ); 
        setEdges(parsed.edges );
      } else { // Limpiar si el contenido está vacío
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Error al parsear contenido:', error);
      setNodes([]); 
      setEdges([]); 
    }
  }, [content, setNodes, setEdges]); 

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}