import { useState } from 'react';
import './App.css';
import Header from './components/header';
import Customization from './components/Customization';
import EditorArea from './components/EditorArea';
import { Toaster } from 'react-hot-toast';

function App() {
  const [content, setContent] = useState('');
  const [visualContent, setVisualContent] = useState('');
  const [layout, setLayout] = useState<'top-down' | 'left-right' | 'right-left' | 'bottom-up'>('top-down');
  const [useCurvedEdges, setUseCurvedEdges] = useState(false);

  return (
    <div className="main-container">
      <Toaster position="top-right" />
      <Header />
      <Customization
        layout={layout}
        setLayout={setLayout}
        useCurvedEdges={useCurvedEdges}
        setUseCurvedEdges={setUseCurvedEdges}
      />
      <EditorArea
        content={content}
        setContent={setContent}
        visualContent={visualContent}
        setVisualContent={setVisualContent}
        layout={layout}
        useCurvedEdges={useCurvedEdges}
      />
    </div>
  );
}

export default App;
