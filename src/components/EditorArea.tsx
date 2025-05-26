import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Editor from './editor';
import Visualization from './visualization';
import { kazeFile } from '../data/test.kaze';

type EditorAreaProps = {
  content: string;
  setContent: (content: string) => void;
  visualContent: string;
  setVisualContent: (content: string) => void;
  layout: 'top-down' | 'left-right' | 'right-left' | 'bottom-up';
  useCurvedEdges: boolean;
};

export default function EditorArea({ content, setContent, visualContent, setVisualContent, layout, useCurvedEdges }: EditorAreaProps) {

  const updateContent = () => {
    setVisualContent(content);
  };

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
     if (selected === 'example1') {
      setContent(kazeFile.toString());
      console.log('content'+content)
     } 
  };

  return (
    <div className="app-container">
      <div className="editor-wrapper">
        <div className="editor-selector">
          <select onChange={handleExampleChange} value={content === kazeFile ? 'example1' : ''}>
            <option value="">Seleccionar ejemplo</option>
            <option value="example1">Ejemplo 1</option>
          </select>
        </div>
        <div className="editor-container">
          <Editor content={content} onSetContent={setContent} />
        </div>
      </div>

      <div className="translate-button">
        <button
          className="boton-flecha"
          onClick={updateContent}
          style={{ opacity: content.trim() ? 1 : 0.5 }}
          disabled={!content.trim()}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="diagram-container">
        <Visualization content={visualContent} layout={layout} useCurvedEdges={useCurvedEdges} />
      </div>
    </div>
  );
}