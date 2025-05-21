import { useState } from 'react';
import Visualization from './components/visualization'
import './App.css';
import Editor from './components/editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [visualContent, setVisualContent] = useState('');

  const updateContent = () => {
    setVisualContent(content);
  };

  return (
    <div className="app-container">
      <Editor content={content} onSetContent={setContent} />
      <div className="boton-container">
        <button className="boton-flecha" onClick={updateContent}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <div className="diagram-component">
        <Visualization content={visualContent} />
      </div>
    </div>
  );
}

export default App;