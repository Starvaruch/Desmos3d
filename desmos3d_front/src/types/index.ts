// Типы для работы с уравнениями
export interface Equation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  error?: string;
}

// Типы для настроек графика
export interface GraphConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xStep: number;
  gridVisible: boolean;
}

// Тип для точки на графике
export interface Point {
  x: number;
  y: number;
} 