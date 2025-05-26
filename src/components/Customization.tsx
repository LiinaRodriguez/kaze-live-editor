type CustomizationProps = {
  layout: 'top-down' | 'left-right' | 'right-left' | 'bottom-up';
  setLayout: (layout: 'top-down' | 'left-right' | 'right-left' | 'bottom-up') => void;
  useCurvedEdges: boolean;
  setUseCurvedEdges: (useCurvedEdges: boolean) => void;
};

export default function Customization({ layout, setLayout, useCurvedEdges, setUseCurvedEdges }: CustomizationProps) {
  return (
    <div className="customization">
     
      <div className="customization-options">
        <div className="select-wrapper">
          <select
            onChange={(e) => setLayout(e.target.value as 'top-down' | 'left-right' | 'right-left' | 'bottom-up')}
            value={layout}
          >
            <option value="top-down">Arriba → Abajo</option>
            <option value="left-right">Izquierda → Derecha</option>
            <option value="right-left">Derecha → Izquierda</option>
            <option value="bottom-up">Abajo → Arriba</option>
          </select>
        </div>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={useCurvedEdges}
            onChange={(e) => setUseCurvedEdges(e.target.checked)}
          />
          <span className="checkbox-label">Usar líneas curvas</span>
        </label>
      </div>
    </div>
  );
}