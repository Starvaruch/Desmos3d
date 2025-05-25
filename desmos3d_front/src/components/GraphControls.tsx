import { GraphConfig } from '../types';
import './GraphControls.css';

interface GraphControlsProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({ config, onConfigChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;
    
    onConfigChange({
      ...config,
      [name]: newValue
    });
  };

  return (
    <div className="graph-controls">
      <div className="controls-header">
        <h2 className="controls-title">Настройки графика</h2>
        <p className="controls-description">Настройте параметры отображения графика</p>
      </div>
      
      <div className="control-section">
        <h3 className="section-title">Диапазон значений X</h3>
        <div className="control-group">
          <label className="control-label">Минимум X</label>
          <input
            type="number"
            name="xMin"
            value={config.xMin}
            onChange={handleChange}
            className="control-input"
          />
        </div>
        <div className="control-group">
          <label className="control-label">Максимум X</label>
          <input
            type="number"
            name="xMax"
            value={config.xMax}
            onChange={handleChange}
            className="control-input"
          />
        </div>
        <div className="control-group">
          <label className="control-label">Шаг X</label>
          <input
            type="number"
            name="xStep"
            value={config.xStep}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            max="1"
            className="control-input"
          />
        </div>
      </div>
      
      <div className="control-section">
        <h3 className="section-title">Диапазон значений Y</h3>
        <div className="control-group">
          <label className="control-label">Минимум Y</label>
          <input
            type="number"
            name="yMin"
            value={config.yMin}
            onChange={handleChange}
            className="control-input"
          />
        </div>
        <div className="control-group">
          <label className="control-label">Максимум Y</label>
          <input
            type="number"
            name="yMax"
            value={config.yMax}
            onChange={handleChange}
            className="control-input"
          />
        </div>
      </div>
      
      <div className="control-section">
        <h3 className="section-title">Отображение</h3>
        <div className="control-group">
          <label className="checkbox-control">
            <input
              type="checkbox"
              name="gridVisible"
              checked={config.gridVisible}
              onChange={handleChange}
            />
            <div className="custom-checkbox"></div>
            <span className="checkbox-label">Показывать сетку</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GraphControls; 