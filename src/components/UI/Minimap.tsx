import React, { useState, useRef, useCallback } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { getItemBounds } from '../../utils/math';

export const Minimap: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const items = useBoardStore((s) => s.items);

  const stageX = useCanvasStore((s) => s.x);
  const stageY = useCanvasStore((s) => s.y);
  const scale = useCanvasStore((s) => s.scale);
  const windowWidth = useCanvasStore((s) => s.width);
  const windowHeight = useCanvasStore((s) => s.height);
  const setViewport = useCanvasStore((s) => s.setViewport);

  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport bounds in virtual canvas coordinates
  const viewportBounds = {
    x: -stageX / scale,
    y: -stageY / scale,
    width: windowWidth / scale,
    height: windowHeight / scale,
  };

  // Find total bounding box including both items and viewport
  let minX = viewportBounds.x;
  let minY = viewportBounds.y;
  let maxX = viewportBounds.x + viewportBounds.width;
  let maxY = viewportBounds.y + viewportBounds.height;

  for (const item of items) {
    const b = getItemBounds(item);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  // Add 10% breathing room padding
  const paddingX = Math.max((maxX - minX) * 0.1, 200);
  const paddingY = Math.max((maxY - minY) * 0.1, 200);
  minX -= paddingX;
  minY -= paddingY;
  maxX += paddingX;
  maxY += paddingY;

  const totalWidth = Math.max(maxX - minX, 100);
  const totalHeight = Math.max(maxY - minY, 100);

  const mapWidth = 190;
  const mapHeight = 120;
  const scaleRatio = Math.min(mapWidth / totalWidth, mapHeight / totalHeight);

  // Convert canvas coord to minimap SVG coord
  const toMini = useCallback(
    (x: number, y: number) => ({
      x: (x - minX) * scaleRatio + (mapWidth - totalWidth * scaleRatio) / 2,
      y: (y - minY) * scaleRatio + (mapHeight - totalHeight * scaleRatio) / 2,
    }),
    [minX, minY, scaleRatio, totalWidth, totalHeight]
  );

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickMiniX = e.clientX - rect.left;
    const clickMiniY = e.clientY - rect.top;

    // Convert minimap coord back to virtual canvas coord
    const offsetX = (mapWidth - totalWidth * scaleRatio) / 2;
    const offsetY = (mapHeight - totalHeight * scaleRatio) / 2;

    const targetCanvasX = (clickMiniX - offsetX) / scaleRatio + minX;
    const targetCanvasY = (clickMiniY - offsetY) / scaleRatio + minY;

    // Center viewport at targetCanvasX, targetCanvasY
    const newStageX = windowWidth / 2 - targetCanvasX * scale;
    const newStageY = windowHeight / 2 - targetCanvasY * scale;

    setViewport(newStageX, newStageY, scale);
  };

  const miniViewport = toMini(viewportBounds.x, viewportBounds.y);
  const miniViewportW = Math.max(6, viewportBounds.width * scaleRatio);
  const miniViewportH = Math.max(6, viewportBounds.height * scaleRatio);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 right-4 z-30 flex flex-col items-end select-none"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-xl shadow-black/10 overflow-hidden flex flex-col">
        {/* Header / Collapse toggle */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-800/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Minimap</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Minimap SVG canvas */}
        {isExpanded && (
          <div className="p-2 cursor-pointer bg-neutral-50 dark:bg-neutral-950">
            <svg
              width={mapWidth}
              height={mapHeight}
              onClick={handleMinimapClick}
              className="rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Item Previews */}
              {items.map((item) => {
                const b = getItemBounds(item);
                const pos = toMini(b.x, b.y);
                const w = Math.max(2, b.width * scaleRatio);
                const h = Math.max(2, b.height * scaleRatio);

                let fill = '#94A3B8';
                if (item.type === 'sticky') fill = item.color || '#FEF08A';
                else if (item.type === 'shape') fill = item.fill && item.fill !== 'transparent' ? item.fill : item.stroke;
                else if (item.type === 'connector') fill = item.color || '#2563EB';

                return (
                  <rect
                    key={item.id}
                    x={pos.x}
                    y={pos.y}
                    width={w}
                    height={h}
                    fill={fill}
                    opacity={0.8}
                    rx={1}
                  />
                );
              })}

              {/* Viewport Box (where camera is looking) */}
              <rect
                x={miniViewport.x}
                y={miniViewport.y}
                width={miniViewportW}
                height={miniViewportH}
                fill="rgba(59, 130, 246, 0.18)"
                stroke="#2563EB"
                strokeWidth={1.5}
                rx={2}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

