import React, { useRef, useEffect } from 'react';
import { Equation, GraphConfig, Point } from '../types';
import { evaluate } from 'mathjs';
import './Graph.css';

interface GraphProps {
  equations: Equation[];
  config: GraphConfig;
}

const Graph: React.FC<GraphProps> = ({ equations, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Функция для вычисления точек графика на основе уравнения
  const calculatePoints = (equation: Equation, config: GraphConfig): Point[] => {
    const points: Point[] = [];
    const { xMin, xMax, xStep } = config;

    try {
      for (let x = xMin; x <= xMax; x += xStep) {
        // Заменяем x в выражении и вычисляем значение y
        const expr = equation.expression.replace(/x/g, x.toString());
        const y = evaluate(expr);

        // Проверяем, что результат - это число и оно не бесконечное
        if (
          typeof y === 'number' && 
          !isNaN(y) && 
          isFinite(y)
        ) {
          points.push({ x, y });
        } else {
          // Если точка недействительна, добавляем разрыв (null)
          if (points.length > 0 && points[points.length - 1] !== null) {
            // @ts-ignore - Добавляем null как маркер разрыва
            points.push(null);
          }
        }
      }
      return points;
    } catch (error) {
      console.error('Error calculating points:', error);
      return [];
    }
  };

  // Функция для отрисовки графика
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Получаем размеры canvas
    const { width, height } = canvas;

    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);

    // Рисуем сетку, если она включена
    if (config.gridVisible) {
      drawGrid(ctx, width, height);
    }

    // Рисуем оси координат
    drawAxes(ctx, width, height);

    // Рисуем графики для каждого уравнения
    equations.forEach(equation => {
      if (equation.visible) {
        const points = calculatePoints(equation, config);
        drawEquation(ctx, points, equation.color);
      }
    });
  };

  // Функция для рисования сетки
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 2.5;

    // Вертикальные линии
    for (let x = Math.ceil(config.xMin); x <= config.xMax; x++) {
      const canvasX = ((x - config.xMin) / (config.xMax - config.xMin)) * width;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = Math.ceil(config.yMin); y <= config.yMax; y++) {
      const canvasY = height - ((y - config.yMin) / (config.yMax - config.yMin)) * height;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }
  };

  // Функция для рисования осей координат
  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Ось X
    const yAxis = height - ((0 - config.yMin) / (config.yMax - config.yMin)) * height;
    ctx.beginPath();
    ctx.moveTo(0, yAxis);
    ctx.lineTo(width, yAxis);
    ctx.stroke();

    // Ось Y
    const xAxis = ((0 - config.xMin) / (config.xMax - config.xMin)) * width;
    ctx.beginPath();
    ctx.moveTo(xAxis, 0);
    ctx.lineTo(xAxis, height);
    ctx.stroke();

    // Метки по осям
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Метки по оси X
    for (let x = Math.ceil(config.xMin); x <= config.xMax; x++) {
      if (x === 0) continue;
      const canvasX = ((x - config.xMin) / (config.xMax - config.xMin)) * width;
      ctx.fillText(x.toString(), canvasX, yAxis + 5);
    }

    // Метки по оси Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(config.yMin); y <= config.yMax; y++) {
      if (y === 0) continue;
      const canvasY = height - ((y - config.yMin) / (config.yMax - config.yMin)) * height;
      ctx.fillText(y.toString(), xAxis - 5, canvasY);
    }

    // Рисуем 0 на пересечении
    if (xAxis >= 0 && xAxis <= width && yAxis >= 0 && yAxis <= height) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('0', xAxis - 5, yAxis + 5);
    }
  };

  // Функция для отрисовки уравнения
  const drawEquation = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string
  ) => {
    if (points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let isFirstPoint = true;

    points.forEach((point) => {
      if (point === null) {
        isFirstPoint = true;
        return;
      }

      const canvasX = ((point.x - config.xMin) / (config.xMax - config.xMin)) * ctx.canvas.width;
      const canvasY = ctx.canvas.height - ((point.y - config.yMin) / (config.yMax - config.yMin)) * ctx.canvas.height;

      if (isFirstPoint) {
        ctx.moveTo(canvasX, canvasY);
        isFirstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    });

    ctx.stroke();
  };

  // Обработчик изменения размера окна
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Устанавливаем размеры canvas равными размерам контейнера
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    // Перерисовываем график
    drawGraph();
  };

  // Инициализация и обновление при изменении размеров
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Перерисовываем график при изменении уравнений или настроек
  useEffect(() => {
    drawGraph();
  }, [equations, config]);

  return (
    <div className="graph">
      <canvas ref={canvasRef} className="graph-canvas"></canvas>
    </div>
  );
};

export default Graph; 