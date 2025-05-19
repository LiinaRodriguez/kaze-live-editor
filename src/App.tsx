import Visualization from './components/visualization'
 
export default function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ width: '50%', borderRight: '1px solid #ccc' }}>Editor</div>
      <div style={{ width: '50%' }}>
        <Visualization />
      </div>
    </div>
  );
}
