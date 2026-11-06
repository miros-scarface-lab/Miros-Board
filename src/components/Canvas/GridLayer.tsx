import React from 'react';
import { Layer, Shape } from 'react-konva';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useBoardStore } from '../../store/useBoardStore';

export const GridLayer: React.FC = () => {
  const { x, y, scale, width, height } = useCanvasStore();
  const theme = useBoardStore((s) => s.theme);

  // Dynamic grid spacing based on zoom level to stay clean
  let baseSpacing = 32;
  if (scale < 0.25) baseSpacing = 128;
  else if (scale < 0.5) baseSpacing = 64;
  else if (scale > 2) baseSpacing = 16;

  const dotColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.14)';
  const dotRadius = Math.max(1 / scale, 1.2);

  // Calculate visible range in virtual board coordinates
  const startX = Math.floor((-x / scale) / baseSpacing) * baseSpacing;
  const endX = Math.ceil(((-x + width) / scale) / baseSpacing) * baseSpacing;
  const startY = Math.floor((-y / scale) / baseSpacing) * baseSpacing;
  const endY = Math.ceil(((-y + height) / scale) / baseSpacing) * baseSpacing;

  return (
    <Layer listening={false}>
      <Shape
        sceneFunc={(context) => {
          context.beginPath();
          for (let gx = startX; gx <= endX; gx += baseSpacing) {
            for (let gy = startY; gy <= endY; gy += baseSpacing) {
              context.moveTo(gx + dotRadius, gy);
              context.arc(gx, gy, dotRadius, 0, Math.PI * 2);
            }
          }
          context.fillStyle = dotColor;
          context.fill();
        }}
      />
    </Layer>
  );
};

