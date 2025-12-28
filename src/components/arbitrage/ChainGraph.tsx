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

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    ctx.clearRect(0, 0, width, height);

    const nodeCount = chain.length - 1;
    const angleStep = (2 * Math.PI) / nodeCount;

    const nodes: { x: number; y: number; crypto: string }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = i * angleStep - Math.PI / 2;
      nodes.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        crypto: chain[i]
      });
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = profitPercent >= 7 ? '#22c55e' : profitPercent >= 5 ? '#3b82f6' : '#8b5cf6';

    for (let i = 0; i < nodes.length; i++) {
      const start = nodes[i];
      const end = nodes[(i + 1) % nodes.length];

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const offsetY = i % 2 === 0 ? -15 : 15;
      ctx.fillText(exchanges[i], midX, midY + offsetY);
    }

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 35, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = profitPercent >= 7 ? '#22c55e' : profitPercent >= 5 ? '#3b82f6' : '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.crypto, node.x, node.y);
    });

    ctx.fillStyle = profitPercent >= 7 ? '#22c55e' : profitPercent >= 5 ? '#3b82f6' : '#8b5cf6';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${profitPercent.toFixed(2)}%`, centerX, centerY);

  }, [chain, exchanges, profitPercent]);

  return (
    <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-border p-4">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400}
        className="w-full h-auto max-w-md mx-auto"
      />
    </Card>
  );
};
