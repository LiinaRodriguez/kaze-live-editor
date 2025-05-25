import { useState } from 'react';
import Visualization from './components/visualization';
import './App.css';
import Editor from './components/editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [content, setContent] = useState('');
  const [visualContent, setVisualContent] = useState('');
  const [layout, setLayout] = useState<'top-down' | 'left-right' | 'right-left' | 'bottom-up'>('top-down');
  const [useCurvedEdges, setUseCurvedEdges] = useState(false);

  const updateContent = () => {
    setVisualContent(content);
  };

  return (
    <div className="main-container">
      <h1>KAZE</h1>
      <div className="customization">
        <h2>Personalización</h2>
        <div className="customization-options">
          <select onChange={(e) => setLayout(e.target.value as any)} value={layout}>
            <option value="top-down">Arriba-Abajo</option>
            <option value="left-right">Izquierda-Derecha</option>
            <option value="right-left">Derecha-Izquierda</option>
            <option value="bottom-up">Abajo-Arriba</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={useCurvedEdges}
              onChange={(e) => setUseCurvedEdges(e.target.checked)}
            />
            Usar líneas curvas
          </label>
        </div>
      </div>

      <div className="app-container">
        <div className="editor-container">
          <Editor content={content} onSetContent={setContent} />
        </div>

        <div className="translate-button">
          <button className="boton-flecha" onClick={updateContent}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        <div className="diagram-container">
          <Visualization content={visualContent} layout={layout} useCurvedEdges={useCurvedEdges} />
        </div>
      </div>
    </div>
  );
}

export default App;
