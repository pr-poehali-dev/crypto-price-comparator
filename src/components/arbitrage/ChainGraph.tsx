import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ChainGraphProps {
  chain: string[];
  exchanges: string[];
  profitPercent: number;
}

export const ChainGraph = ({ chain, exchanges, profitPercent }: ChainGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 400;
    const height = 400;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.32;

    ctx.clearRect(0, 0, width * dpr, height * dpr);

    // Определяем цветовую схему по прибыли
    const getColorScheme = (profit: number) => {
      if (profit >= 7) return {
        primary: '#10b981',
        secondary: '#34d399',
        glow: 'rgba(16, 185, 129, 0.3)',
        gradient: ['#10b981', '#34d399']
      };
      if (profit >= 5) return {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        glow: 'rgba(59, 130, 246, 0.3)',
        gradient: ['#3b82f6', '#60a5fa']
      };
      return {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        glow: 'rgba(139, 92, 246, 0.3)',
        gradient: ['#8b5cf6', '#a78bfa']
      };
    };

    const colors = getColorScheme(profitPercent);
    const nodeCount = chain.length - 1;
    const angleStep = (2 * Math.PI) / nodeCount;

    // Создаем узлы
    const nodes: { x: number; y: number; crypto: string }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      nodes.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        crypto: chain[i]
      });
    }

    // Рисуем фоновое свечение для связей
    for (let i = 0; i < nodes.length; i++) {
      const start = nodes[i];
      const end = nodes[(i + 1) % nodes.length];

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 12;
      ctx.strokeStyle = colors.glow;
      ctx.stroke();
    }

    // Рисуем основные связи с градиентом
    for (let i = 0; i < nodes.length; i++) {
      const start = nodes[i];
      const end = nodes[(i + 1) % nodes.length];

      const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      gradient.addColorStop(0, colors.gradient[0]);
      gradient.addColorStop(1, colors.gradient[1]);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = gradient;
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Рисуем стрелку
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      
      // Фон стрелки
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fillStyle = colors.primary;
      ctx.fill();
      
      // Обводка стрелки
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.restore();

      // Название биржи с фоном
      const exchangeName = exchanges[i];
      ctx.font = 'bold 11px sans-serif';
      const textWidth = ctx.measureText(exchangeName).width;
      
      // Определяем позицию текста
      const textOffsetDistance = 25;
      const normalX = -(end.y - start.y);
      const normalY = (end.x - start.x);
      const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
      const textX = midX + (normalX / normalLength) * textOffsetDistance;
      const textY = midY + (normalY / normalLength) * textOffsetDistance;

      // Фон для текста
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.beginPath();
      ctx.roundRect(textX - textWidth / 2 - 6, textY - 10, textWidth + 12, 20, 10);
      ctx.fill();
      
      // Обводка фона
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Текст биржи
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(exchangeName, textX, textY);
    }

    // Рисуем узлы криптовалют
    nodes.forEach((node, index) => {
      // Внешнее свечение
      const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 50);
      glowGradient.addColorStop(0, colors.glow);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, 50, 0, 2 * Math.PI);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Основной круг с градиентом
      const nodeGradient = ctx.createRadialGradient(
        node.x - 10, node.y - 10, 5,
        node.x, node.y, 40
      );
      nodeGradient.addColorStop(0, '#334155');
      nodeGradient.addColorStop(1, '#1e293b');

      ctx.beginPath();
      ctx.arc(node.x, node.y, 38, 0, 2 * Math.PI);
      ctx.fillStyle = nodeGradient;
      ctx.fill();

      // Цветная обводка
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Внутренняя обводка
      ctx.beginPath();
      ctx.arc(node.x, node.y, 34, 0, 2 * Math.PI);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Номер шага (маленький бейдж)
      ctx.beginPath();
      ctx.arc(node.x + 25, node.y - 25, 12, 0, 2 * Math.PI);
      ctx.fillStyle = colors.primary;
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), node.x + 25, node.y - 25);

      // Текст криптовалюты
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.crypto, node.x, node.y);
    });

    // Центральный индикатор прибыли
    const centerRadius = 55;
    
    // Фон с градиентом
    const centerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius
    );
    centerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
    centerGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Цветная обводка
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Внутренняя тонкая обводка
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius - 5, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Иконка процента вверху
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↗', centerX, centerY - 12);

    // Текст прибыли
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`+${profitPercent.toFixed(2)}%`, centerX, centerY + 8);

    // Подпись "прибыль"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('прибыль', centerX, centerY + 26);

  }, [chain, exchanges, profitPercent]);

  return (
    <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 p-3 hover:border-slate-600/50 transition-all duration-300 shadow-lg">
      <canvas 
        ref={canvasRef}
        className="w-full h-auto max-w-md mx-auto"
      />
    </Card>
  );
};
