import { useState, useEffect } from 'react'
import './App.css'
import GraphPlotter from './components/GraphPlotter'
import Navbar from './components/Navbar'
import { Equation, GraphConfig } from './types'
import { authService, graphService } from './api'

function App() {
  // Состояние для уравнений
  const [equations, setEquations] = useState<Equation[]>([
    {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      expression: 'sin(x)',
      color: '#3498db',
      visible: true
    }
  ]);

  // Состояние для настроек графика
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    xStep: 0.1,
    gridVisible: true
  });

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Если пользователь авторизован, загружаем его уравнения и конфигурации
          const graphConfigs = await graphService.getGraphConfigs();
          const userEquations = await graphService.getEquations();
          
          if (graphConfigs.length > 0) {
            // Используем первую конфигурацию
            const config = graphConfigs[0];
            setGraphConfig({
              xMin: config.xMin,
              xMax: config.xMax,
              yMin: config.yMin,
              yMax: config.yMax,
              xStep: config.xStep,
              gridVisible: config.gridVisible
            });
          }
          
          if (userEquations.length > 0) {
            // Загружаем уравнения пользователя
            setEquations(userEquations.map(eq => ({
              id: eq.id.toString(),
              expression: eq.expression,
              color: eq.color,
              visible: eq.visible
            })));
          }
        } else {
          // Если пользователь не авторизован, загружаем дефолтные данные
          const defaultData = await graphService.getDefaultData();
          
          setGraphConfig({
            xMin: defaultData.config.xMin,
            xMax: defaultData.config.xMax,
            yMin: defaultData.config.yMin,
            yMax: defaultData.config.yMax,
            xStep: defaultData.config.xStep,
            gridVisible: defaultData.config.gridVisible
          });
          
          setEquations(defaultData.equations.map(eq => ({
            id: eq.id.toString(),
            expression: eq.expression,
            color: eq.color,
            visible: eq.visible
          })));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    
    loadInitialData();
  }, []);
  
  return (
    <div className="app-container">
      <Navbar 
        equations={equations} 
        config={graphConfig} 
        setEquations={setEquations} 
        setConfig={setGraphConfig} 
      />
      <main>
        <GraphPlotter 
          initialEquations={equations}
          initialConfig={graphConfig}
          onEquationsChange={setEquations}
          onConfigChange={setGraphConfig}
        />
      </main>
    </div>
  )
}

export default App
