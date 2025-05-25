import { Equation } from '../types';
import './EquationEditor.css';

interface EquationEditorProps {
  equations: Equation[];
  onAddEquation: () => void;
  onRemoveEquation: (id: string) => void;
  onUpdateEquation: (equation: Equation) => void;
}

const EquationEditor: React.FC<EquationEditorProps> = ({
  equations,
  onAddEquation,
  onRemoveEquation,
  onUpdateEquation
}) => {
  const handleExpressionChange = (id: string, value: string) => {
    const equation = equations.find(eq => eq.id === id);
    if (equation) {
      onUpdateEquation({ ...equation, expression: value });
    }
  };

  const handleColorChange = (id: string, color: string) => {
    const equation = equations.find(eq => eq.id === id);
    if (equation) {
      onUpdateEquation({ ...equation, color });
    }
  };

  const toggleVisibility = (id: string) => {
    const equation = equations.find(eq => eq.id === id);
    if (equation) {
      onUpdateEquation({ ...equation, visible: !equation.visible });
    }
  };

  return (
    <div className="equation-editor">
      <div className="editor-header">
        <h2 className="editor-title">Уравнения</h2>
        <button className="add-equation-btn" onClick={onAddEquation}>
          Добавить
        </button>
      </div>

      <div className="equations-list">
        {equations.length === 0 ? (
          <div className="no-equations">
            Нет уравнений. Добавьте уравнение, чтобы начать.
          </div>
        ) : (
          equations.map(equation => (
            <div 
              key={equation.id} 
              className={`equation-item ${equation.error ? 'has-error' : ''}`}
            >
              <div className="equation-header">
                <h3 className="equation-title">Уравнение</h3>
                <div className="equation-controls">
                  <button
                    type="button"
                    className={`visibility-toggle ${equation.visible ? 'visible' : 'hidden'}`}
                    onClick={() => toggleVisibility(equation.id)}
                    title={equation.visible ? "Скрыть" : "Показать"}
                  >
                  </button>
                  <button
                    type="button"
                    className="remove-equation-btn"
                    onClick={() => onRemoveEquation(equation.id)}
                    title="Удалить уравнение"
                  >
                  </button>
                </div>
              </div>
              <div className="equation-input-group">
                <input
                  type="text"
                  className={`equation-input ${equation.error ? 'error' : ''}`}
                  value={equation.expression}
                  onChange={(e) => handleExpressionChange(equation.id, e.target.value)}
                  placeholder="Введите уравнение (например: sin(x))"
                />
                <input
                  type="color"
                  className="color-picker"
                  value={equation.color}
                  onChange={(e) => handleColorChange(equation.id, e.target.value)}
                  title="Выбрать цвет"
                />
              </div>
              {equation.error && (
                <div className="error-text">{equation.error}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EquationEditor; 