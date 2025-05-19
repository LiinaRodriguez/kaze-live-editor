import Visualization from './components/visualization'
import './App.css';
import Editor from './components/editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Editor />
      <div className="boton-container">
        <button className="boton-flecha">
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
      <div className="diagram-component">
      <Visualization />
      </div>
    </div>
  );
}

export default App;
