import { useState, useEffect } from 'react';
import { Equation, GraphConfig } from '../types';
import EquationEditor from './EquationEditor';
import Graph from './Graph';
import GraphControls from './GraphControls';
import { evaluate } from 'mathjs';
import './GraphPlotter.css';

// Определение пропсов
interface GraphPlotterProps {
  initialEquations?: Equation[];
  initialConfig?: GraphConfig;
  onEquationsChange?: (equations: Equation[]) => void;
  onConfigChange?: (config: GraphConfig) => void;
}

// Генерация случайного цвета
const getRandomColor = (): string => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#d35400', '#34495e', '#2980b9', '#c0392b'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Генерация уникального ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const GraphPlotter: React.FC<GraphPlotterProps> = ({ 
  initialEquations, 
  initialConfig,
  onEquationsChange,
  onConfigChange
}) => {
  // Состояние для уравнений
  const [equations, setEquations] = useState<Equation[]>(
    initialEquations || [
      {
        id: generateId(),
        expression: 'sin(x)',
        color: getRandomColor(),
        visible: true
      }
    ]
  );

  // Состояние для настроек графика
  const [graphConfig, setGraphConfig] = useState<GraphConfig>(
    initialConfig || {
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      xStep: 0.1,
      gridVisible: true
    }
  );

  // Обновляем состояние при изменении initialEquations или initialConfig
  useEffect(() => {
    if (initialEquations) {
      setEquations(initialEquations);
    }
  }, [initialEquations]);

  useEffect(() => {
    if (initialConfig) {
      setGraphConfig(initialConfig);
    }
  }, [initialConfig]);

  // Обработчик изменения уравнений
  const handleEquationsChange = (newEquations: Equation[]) => {
    setEquations(newEquations);
    if (onEquationsChange) {
      onEquationsChange(newEquations);
    }
  };

  // Обработчик изменения конфигурации
  const handleConfigChange = (newConfig: GraphConfig) => {
    setGraphConfig(newConfig);
    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  // Добавление нового уравнения
  const addEquation = () => {
    const newEquation: Equation = {
      id: generateId(),
      expression: '',
      color: getRandomColor(),
      visible: true
    };
    const newEquations = [...equations, newEquation];
    handleEquationsChange(newEquations);
  };

  // Удаление уравнения
  const removeEquation = (id: string) => {
    const newEquations = equations.filter(eq => eq.id !== id);
    handleEquationsChange(newEquations);
  };

  // Обновление уравнения
  const updateEquation = (updatedEquation: Equation) => {
    const newEquations = equations.map(eq => 
      eq.id === updatedEquation.id ? updatedEquation : eq
    );
    handleEquationsChange(newEquations);
  };

  // Проверка корректности уравнений
  useEffect(() => {
    const validatedEquations = equations.map(eq => {
      try {
        // Проверяем корректность выражения, подставляя тестовое значение x
        if (eq.expression.trim()) {
          evaluate(eq.expression.replace(/x/g, '0'));
          return { ...eq, error: undefined };
        }
        return eq;
      } catch (error) {
        return { ...eq, error: 'Некорректное выражение' };
      }
    });

    if (JSON.stringify(validatedEquations) !== JSON.stringify(equations)) {
      handleEquationsChange(validatedEquations);
    }
  }, [equations]);

  return (
    <div className="graph-plotter">
      <div className="layout">
        <div className="controls-panel">
          <GraphControls 
            config={graphConfig} 
            onConfigChange={handleConfigChange} 
          />
          <EquationEditor 
            equations={equations}
            onAddEquation={addEquation}
            onRemoveEquation={removeEquation}
            onUpdateEquation={updateEquation}
          />
        </div>
        <div className="graph-container">
          <Graph 
            equations={equations.filter(eq => eq.visible && !eq.error)} 
            config={graphConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphPlotter; 