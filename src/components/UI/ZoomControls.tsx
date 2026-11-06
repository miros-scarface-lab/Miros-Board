import React, { useState } from 'react';
import { Minus, Plus, Maximize, RotateCcw } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useBoardStore } from '../../store/useBoardStore';
import { getCombinedBounds } from '../../utils/math';

export const ZoomControls: React.FC = () => {
  const scale = useCanvasStore((s) => s.scale);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const resetZoom = useCanvasStore((s) => s.resetZoom);
  const setZoomPercent = useCanvasStore((s) => s.setZoomPercent);
  const zoomToFit = useCanvasStore((s) => s.zoomToFit);
  const items = useBoardStore((s) => s.items);

  const [isOpen, setIsOpen] = useState(false);

  const percent = Math.round(scale * 100);

  const presets = [50, 75, 100, 150, 200, 300];

  return (
    <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 select-none">
      <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-1 shadow-lg shadow-black/5 text-neutral-700 dark:text-neutral-300">
        {/* Zoom Out (-) */}
        <button
          onClick={zoomOut}
          title="Zoom out (Ctrl -)"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Zoom Percent Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 py-1 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors min-w-[52px] text-center"
            title="Click for zoom options"
          >
            {percent}%
          </button>

          {/* Quick presets popover */}
          {isOpen && (
            <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-1 shadow-xl flex flex-col min-w-[80px] animate-in fade-in zoom-in-95 duration-100">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setZoomPercent(p);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    percent === p ? 'font-bold text-blue-600' : ''
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom In (+) */}
        <button
          onClick={zoomIn}
          title="Zoom in (Ctrl +)"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto mx-0.5" />

        {/* Reset Zoom */}
        <button
          onClick={resetZoom}
          title="Reset Zoom to 100% (Ctrl+0)"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Fit to screen */}
        <button
          onClick={() => zoomToFit(getCombinedBounds(items))}
          title="Zoom to Fit All (Shift + 1)"
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

