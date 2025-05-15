import { useState } from 'react';
import { parseToReactFlow } from 'kaze';
import type { KazeEdge, KazeNode } from 'kaze';

import './App.css';

function App() {
  const [nodes, setNodes] = useState<KazeNode[]>([]);
  const [edges, setEdges] = useState<KazeEdge[]>([]);

  const kazefile = `
    root{
      label: "Raiz",
      children: [node1, node2, node3]
      style: {color: #ffb3ba,
      bgcolor: #fffff}
    };

    node1{
      label: "Node 1",
      style:{
        color: #bae1ff
        }
    }

    node2{
      label: "Node 3",
      style:{ color: #bae1ff}
    }

    node3{
      label: "Node 14",
      style: {color: #bae1ff}
    }
  `;

  const handleParse = () => {
    const { nodes, edges } = parseToReactFlow(kazefile);
    setNodes(nodes);
    setEdges(edges);
  };

  return (
    <div className="App">
      <button onClick={handleParse}>Parse Kaze Code</button>

      <div>
        <h3>Nodes:</h3>
        <pre>{JSON.stringify(nodes, null, 2)}</pre>
      </div>
      <div>
        <h3>Edges:</h3>
        <pre>{JSON.stringify(edges, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
