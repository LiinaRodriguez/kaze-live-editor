
import React from 'react';
import { Position, Handle } from '@xyflow/react';

const defaultNodeStyle = {
  padding: '10px 20px',
  borderRadius: '5px',
  borderWidth: '2px',
  borderStyle: 'solid',
  // fontSize: '12px', // Otros defaults
};

interface CustomNodeData {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  label?: string;
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const nodeStyle = {
    ...defaultNodeStyle,
    backgroundColor: data.backgroundColor || '#f0f0f0', 
    borderColor: data.borderColor || data.textColor || '#555', 
    color: data.textColor || '#333',
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div> {/* Manejar etiqueta undefined */}
      <Handle type="source" position={Position.Bottom} />

    </div>
  );
}

export default React.memo(CustomNode);