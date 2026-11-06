import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  StickyNote,
  Type,
  Square,
  Circle as CircleIcon,
  Triangle,
  Diamond,
  PenTool,
  ArrowUpRight,
  Eraser,
  Table as TableIcon,
  Sparkles,
  Check,
} from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { ToolType } from '../../types/tool';
import { ShapeType } from '../../types/board';
import { STICKY_COLORS, PALETTE_COLORS, STROKE_WIDTHS } from '../../utils/colors';

export const Toolbar: React.FC = () => {
  const activeTool = useBoardStore((s) => s.activeTool);
  const setActiveTool = useBoardStore((s) => s.setActiveTool);
  const toolSettings = useBoardStore((s) => s.toolSettings);
  const updateToolSettings = useBoardStore((s) => s.updateToolSettings);

  const [activeSubMenu, setActiveSubMenu] = useState<'sticky' | 'shape' | 'pen' | 'connector' | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<'sticky' | 'shape' | 'pen' | 'connector' | 'table' | null>(null);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === 'sticky') setActiveSubMenu(activeSubMenu === 'sticky' ? null : 'sticky');
    else if (tool === 'shape') setActiveSubMenu(activeSubMenu === 'shape' ? null : 'shape');
    else if (tool === 'pen') setActiveSubMenu(activeSubMenu === 'pen' ? null : 'pen');
    else if (tool === 'connector') setActiveSubMenu(activeSubMenu === 'connector' ? null : 'connector');
    else if (tool === 'table') setActiveSubMenu(activeSubMenu === 'table' ? null : 'table');
    else setActiveSubMenu(null);
  };

  const shapes: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
    { type: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
    { type: 'rounded-rectangle', label: 'Rounded Rect', icon: <div className="w-4 h-3.5 border-2 border-current rounded-md" /> },
    { type: 'ellipse', label: 'Ellipse', icon: <CircleIcon className="w-4 h-4" /> },
    { type: 'triangle', label: 'Triangle', icon: <Triangle className="w-4 h-4" /> },
    { type: 'diamond', label: 'Diamond', icon: <Diamond className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-start gap-3">
      {/* Main Miro Vertical Toolbar */}
      {/* Main miros Vertical Toolbar */}
      <div className="flex flex-col items-center bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-1.5 shadow-xl shadow-black/5 gap-1 select-none">
        {/* Select (V) */}
        <button
          title="Select (V)"
          onClick={() => handleToolClick('select')}
          className={`p-2.5 rounded-xl transition-all duration-150 relative group ${
            activeTool === 'select'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <MousePointer className="w-5 h-5 fill-current" />
          <span className="sr-only">Select</span>
        </button>

        {/* Hand / Pan (H) */}
        <button
          title="Hand / Pan (H or Space + Drag)"
          onClick={() => handleToolClick('hand')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'hand'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-neutral-200 dark:bg-neutral-800 my-1" />

        {/* Sticky Note (N) */}
        <button
          title="Sticky note (N)"
          onClick={() => handleToolClick('sticky')}
          className={`p-2.5 rounded-xl transition-all duration-150 relative ${
            activeTool === 'sticky'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <StickyNote className="w-5 h-5" />
          <span
            className="w-2 h-2 rounded-full absolute bottom-1.5 right-1.5 border border-white"
            style={{ backgroundColor: toolSettings.stickyColor }}
          />
        </button>

        {/* Text (T) */}
        <button
          title="Text (T)"
          onClick={() => handleToolClick('text')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'text'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Type className="w-5 h-5" />
        </button>

        {/* Shapes (S) */}
        <button
          title="Shapes (S)"
          onClick={() => handleToolClick('shape')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'shape'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Square className="w-5 h-5" />
        </button>

        {/* Pen (P) */}
        <button
          title="Pen (P)"
          title="Pen (P) - Smart shape detection available"
          onClick={() => handleToolClick('pen')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
          className={`p-2.5 rounded-xl transition-all duration-150 relative ${
            activeTool === 'pen'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <PenTool className="w-5 h-5" />
          {toolSettings.smartDrawing && (
            <Sparkles className="w-2.5 h-2.5 absolute top-1.5 right-1.5 text-blue-500 fill-blue-500" />
          )}
        </button>

        {/* Connector / Arrow (L) */}
        <button
          title="Connector / Arrow (L)"
          onClick={() => handleToolClick('connector')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'connector'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ArrowUpRight className="w-5 h-5" />
        </button>

        {/* Table / Matrix (M) */}
        <button
          title="Table / Matrix (M)"
          onClick={() => handleToolClick('table')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'table'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <TableIcon className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-neutral-200 dark:bg-neutral-800 my-1" />

        {/* Eraser (E) */}
        <button
          title="Eraser (E)"
          onClick={() => handleToolClick('eraser')}
          className={`p-2.5 rounded-xl transition-all duration-150 ${
            activeTool === 'eraser'
              ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 font-semibold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      {/* Sub-palette Popouts */}
      {activeSubMenu === 'sticky' && activeTool === 'sticky' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 shadow-xl flex flex-col gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
          <span className="text-xs font-semibold text-neutral-500 uppercase px-1">Note Color</span>
          <div className="flex gap-1.5">
            {STICKY_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => updateToolSettings({ stickyColor: c.value })}
                className="w-7 h-7 rounded-lg border border-black/10 transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {toolSettings.stickyColor === c.value && <Check className="w-4 h-4 text-black/60" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSubMenu === 'shape' && activeTool === 'shape' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 shadow-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-left-2 duration-150">
          <span className="text-xs font-semibold text-neutral-500 uppercase px-1">Shape Type</span>
          <div className="flex gap-1.5">
            {shapes.map((s) => (
              <button
                key={s.type}
                onClick={() => updateToolSettings({ shapeType: s.type })}
                className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                  toolSettings.shapeType === s.type
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={s.label}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSubMenu === 'pen' && activeTool === 'pen' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-150">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-150 min-w-[210px]">
          {/* Smart Shape Detection Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Smart Shapes</span>
            </div>
            <button
              onClick={() => updateToolSettings({ smartDrawing: !toolSettings.smartDrawing })}
              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                toolSettings.smartDrawing
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
              }`}
            >
              {toolSettings.smartDrawing ? 'ON' : 'OFF'}
            </button>
          </div>

          <span className="text-xs font-semibold text-neutral-500 uppercase px-0.5">Pen Color</span>
          <div className="grid grid-cols-5 gap-1.5">
            {PALETTE_COLORS.slice(0, 10).map((c) => (
              <button
                key={c.value}
                onClick={() => updateToolSettings({ penColor: c.value })}
                className="w-6 h-6 rounded-md border border-black/10 transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {toolSettings.penColor === c.value && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-neutral-500 uppercase px-0.5 pt-1">Stroke Width</span>
          <div className="flex gap-2">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                onClick={() => updateToolSettings({ penWidth: sw.value })}
                className={`flex-1 py-1 px-2 rounded border text-xs font-medium transition-all ${
                  toolSettings.penWidth === sw.value
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSubMenu === 'connector' && activeTool === 'connector' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-150">
          <span className="text-xs font-semibold text-neutral-500 uppercase px-0.5">Connector Style</span>
          <div className="flex gap-2">
            {(['straight', 'curved', 'orthogonal'] as const).map((st) => (
              <button
                key={st}
                onClick={() => updateToolSettings({ connectorStyle: st })}
                className={`py-1 px-2.5 rounded border text-xs capitalize font-medium transition-all ${
                  toolSettings.connectorStyle === st
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-neutral-500 uppercase px-0.5 pt-1">Line Color</span>
          <div className="flex gap-1.5">
            {PALETTE_COLORS.slice(0, 6).map((c) => (
              <button
                key={c.value}
                onClick={() => updateToolSettings({ connectorColor: c.value })}
                className="w-6 h-6 rounded-md border border-black/10 transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {toolSettings.connectorColor === c.value && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSubMenu === 'table' && activeTool === 'table' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-left-2 duration-150 min-w-[200px]">
          <span className="text-xs font-semibold text-neutral-500 uppercase px-0.5">Table Matrix Size</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: '2 × 2', r: 2, c: 2 },
              { label: '3 × 3', r: 3, c: 3 },
              { label: '4 × 3', r: 4, c: 3 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => updateToolSettings({ tableRows: preset.r, tableCols: preset.c })}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all text-center ${
                  toolSettings.tableRows === preset.r && toolSettings.tableCols === preset.c
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400">Click canvas to drop table. Double-click any cell to edit.</p>
        </div>
      )}
    </div>
  );
};

