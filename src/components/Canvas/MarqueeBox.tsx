import React from 'react';
import { Rect } from 'react-konva';
import { useCanvasStore } from '../../store/useCanvasStore';

export const MarqueeBox: React.FC = () => {
  const marquee = useCanvasStore((s) => s.marquee);

  if (!marquee.active) return null;

  const x = Math.min(marquee.startX, marquee.currentX);
  const y = Math.min(marquee.startY, marquee.currentY);
  const width = Math.abs(marquee.currentX - marquee.startX);
  const height = Math.abs(marquee.currentY - marquee.startY);

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(2, 132, 199, 0.08)"
      stroke="#0284C7"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
};

