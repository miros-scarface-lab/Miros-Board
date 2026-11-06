import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Minus,
  Spline,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { getItemBounds } from '../../utils/math';
import {
  STICKY_COLORS,
  SHAPE_FILL_COLORS,
  PALETTE_COLORS,
  STROKE_WIDTHS,
  FONT_SIZES,
} from '../../utils/colors';
import { ShapeItem, StickyNoteItem, TextItem, ConnectorItem, StrokeItem } from '../../types/board';
import { ShapeItem, StickyNoteItem, TextItem, ConnectorItem, TableItem } from '../../types/board';

export const ContextualToolbar: React.FC = () => {
  const selectedIds = useBoardStore((s) => s.selectedIds);
  const items = useBoardStore((s) => s.items);
  const updateItem = useBoardStore((s) => s.updateItem);
  const duplicateSelected = useBoardStore((s) => s.duplicateSelected);
  const deleteSelected = useBoardStore((s) => s.deleteSelected);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const sendToBack = useBoardStore((s) => s.sendToBack);
  const toggleLock = useBoardStore((s) => s.toggleLock);
  const addTableRow = useBoardStore((s) => s.addTableRow);
  const deleteTableRow = useBoardStore((s) => s.deleteTableRow);
  const addTableCol = useBoardStore((s) => s.addTableCol);
  const deleteTableCol = useBoardStore((s) => s.deleteTableCol);

  const canvasToScreen = useCanvasStore((s) => s.canvasToScreen);
  const scale = useCanvasStore((s) => s.scale);
  const windowWidth = useCanvasStore((s) => s.width);

  const [activePicker, setActivePicker] = useState<'fill' | 'stroke' | 'text' | 'size' | null>(null);
  const [activePicker, setActivePicker] = useState<'fill' | 'stroke' | 'text' | 'size' | 'tableHeader' | null>(null);

  if (selectedIds.length === 0) return null;

  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  if (selectedItems.length === 0) return null;

  // Calculate screen bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const item of selectedItems) {
    const b = getItemBounds(item);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  const screenTopLeft = canvasToScreen({ x: minX, y: minY });
  const screenBottomRight = canvasToScreen({ x: maxX, y: maxY });
  const selWidth = screenBottomRight.x - screenTopLeft.x;

  const toolbarX = Math.max(16, Math.min(windowWidth - 420, screenTopLeft.x + selWidth / 2 - 180));
  const toolbarX = Math.max(16, Math.min(windowWidth - 440, screenTopLeft.x + selWidth / 2 - 200));
  const toolbarY = Math.max(70, screenTopLeft.y - 56);

  const isSingle = selectedItems.length === 1;
  const singleItem = isSingle ? selectedItems[0] : null;
  const isLocked = selectedItems.every((it) => it.locked);

  return (
    <div
      className="absolute z-30 flex flex-col items-center select-none"
      style={{ left: `${toolbarX}px`, top: `${toolbarY}px` }}
    >
      {/* Floating Toolbar Pill */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-2 py-1.5 shadow-xl shadow-black/10 text-neutral-700 dark:text-neutral-300">
        {/* Sticky Note Specifics */}
        {singleItem?.type === 'sticky' && (
          <>
            <button
              onClick={() => setActivePicker(activePicker === 'fill' ? null : 'fill')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              title="Change note color"
            >
              <span
                className="w-4 h-4 rounded-full border border-black/20"
                style={{ backgroundColor: (singleItem as StickyNoteItem).color }}
              />
            </button>
            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />
          </>
        )}

        {/* Shape Specifics */}
        {singleItem?.type === 'shape' && (
          <>
            {/* Fill Color */}
            <button
              onClick={() => setActivePicker(activePicker === 'fill' ? null : 'fill')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              title="Fill color"
            >
              <Palette className="w-4 h-4" />
              <span
                className="w-3.5 h-3.5 rounded border border-black/20"
                style={{ backgroundColor: (singleItem as ShapeItem).fill || '#ffffff' }}
              />
            </button>

            {/* Stroke Color */}
            <button
              onClick={() => setActivePicker(activePicker === 'stroke' ? null : 'stroke')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              title="Border color"
            >
              <Minus className="w-4 h-4" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: (singleItem as ShapeItem).stroke || '#2563EB' }}
              />
            </button>

            {/* Dashed toggle */}
            <button
              onClick={() =>
                updateItem(singleItem.id, {
                  strokeStyle:
                    (singleItem as ShapeItem).strokeStyle === 'dashed' ? 'solid' : 'dashed',
                })
              }
              className={`p-1.5 rounded-lg transition-colors text-xs font-semibold ${
                (singleItem as ShapeItem).strokeStyle === 'dashed'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Dashed border toggle"
            >
              - -
            </button>
            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />
          </>
        )}

        {/* Text Specifics */}
        {singleItem?.type === 'text' && (
          <>
            {/* Font size */}
            <button
              onClick={() => setActivePicker(activePicker === 'size' ? null : 'size')}
              className="px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold"
              title="Font size"
            >
              {(singleItem as TextItem).fontSize || 24}px
            </button>

            {/* Bold */}
            <button
              onClick={() =>
                updateItem(singleItem.id, {
                  bold: !(singleItem as TextItem).bold,
                })
              }
              className={`p-1.5 rounded-lg transition-colors ${
                (singleItem as TextItem).bold
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Italic */}
            <button
              onClick={() =>
                updateItem(singleItem.id, {
                  italic: !(singleItem as TextItem).italic,
                })
              }
              className={`p-1.5 rounded-lg transition-colors ${
                (singleItem as TextItem).italic
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>

            {/* Text Color */}
            <button
              onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center"
              title="Text color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: (singleItem as TextItem).color || '#1E293B' }}
              />
            </button>

            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />
          </>
        )}

        {/* Connector Specifics */}
        {singleItem?.type === 'connector' && (
          <>
            {(['straight', 'curved', 'orthogonal'] as const).map((style) => (
              <button
                key={style}
                onClick={() => updateItem(singleItem.id, { style })}
                className={`px-2 py-1 rounded text-xs capitalize ${
                  (singleItem as ConnectorItem).style === style
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'hover:bg-neutral-100'
                }`}
              >
                {style}
              </button>
            ))}
            <button
              onClick={() => setActivePicker(activePicker === 'stroke' ? null : 'stroke')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 flex items-center"
              title="Line color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: (singleItem as ConnectorItem).color }}
              />
            </button>
            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />
          </>
        )}

        {/* Table / Matrix Specifics */}
        {singleItem?.type === 'table' && (
          <>
            <div className="flex items-center gap-1 text-xs font-semibold px-1 text-neutral-500">
              <span>{(singleItem as TableItem).rows}×{(singleItem as TableItem).cols}</span>
            </div>

            {/* Add / Remove Row */}
            <button
              onClick={() => addTableRow(singleItem.id)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
              title="Add Row (+)"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Row</span>
            </button>

            <button
              onClick={() => deleteTableRow(singleItem.id)}
              disabled={(singleItem as TableItem).rows <= 1}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors text-xs flex items-center gap-1"
              title="Delete Row (-)"
            >
              <MinusCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Row</span>
            </button>

            {/* Add / Remove Col */}
            <button
              onClick={() => addTableCol(singleItem.id)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs flex items-center gap-1"
              title="Add Column (+)"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Col</span>
            </button>

            <button
              onClick={() => deleteTableCol(singleItem.id)}
              disabled={(singleItem as TableItem).cols <= 1}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors text-xs flex items-center gap-1"
              title="Delete Column (-)"
            >
              <MinusCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Col</span>
            </button>

            {/* Table Header Color */}
            <button
              onClick={() => setActivePicker(activePicker === 'tableHeader' ? null : 'tableHeader')}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              title="Header color"
            >
              <span
                className="w-3.5 h-3.5 rounded border border-black/20"
                style={{ backgroundColor: (singleItem as TableItem).headerColor || '#F1F5F9' }}
              />
            </button>

            <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />
          </>
        )}

        {/* Common Actions */}
        {/* Duplicate (Ctrl+D) */}
        <button
          onClick={duplicateSelected}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Bring to Front */}
        <button
          onClick={bringToFront}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Bring to Front"
        >
          <BringToFront className="w-4 h-4" />
        </button>

        {/* Send to Back */}
        <button
          onClick={sendToBack}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Send to Back"
        >
          <SendToBack className="w-4 h-4" />
        </button>

        {/* Lock / Unlock */}
        <button
          onClick={() => toggleLock()}
          className={`p-1.5 rounded-lg transition-colors ${
            isLocked
              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={isLocked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 my-auto" />

        {/* Delete */}
        <button
          onClick={deleteSelected}
          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          title="Delete (Delete or Backspace)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Popover Color Pickers */}
      {activePicker === 'fill' && singleItem && (
        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-xl flex gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          {(singleItem.type === 'sticky' ? STICKY_COLORS : SHAPE_FILL_COLORS).map((c) => (
            <button
              key={c.value}
              onClick={() => {
                if (singleItem.type === 'sticky') updateItem(singleItem.id, { color: c.value });
                if (singleItem.type === 'shape') updateItem(singleItem.id, { fill: c.value });
                setActivePicker(null);
              }}
              className="w-6 h-6 rounded-md border border-black/15 transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {activePicker === 'tableHeader' && singleItem && singleItem.type === 'table' && (
        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-xl flex gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          {[
            { name: 'Slate', value: '#F1F5F9' },
            { name: 'Yellow', value: '#FEF9C3' },
            { name: 'Blue', value: '#E0F2FE' },
            { name: 'Green', value: '#DCFCE7' },
            { name: 'Purple', value: '#F3E8FF' },
            { name: 'Orange', value: '#FFEDD5' },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => {
                updateItem(singleItem.id, { headerColor: c.value });
                setActivePicker(null);
              }}
              className="w-6 h-6 rounded-md border border-black/15 transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {activePicker === 'stroke' && singleItem && (
        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-xl flex gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                if (singleItem.type === 'shape') updateItem(singleItem.id, { stroke: c.value });
                if (singleItem.type === 'connector') updateItem(singleItem.id, { color: c.value });
                setActivePicker(null);
              }}
              className="w-6 h-6 rounded-md border border-black/15 transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {activePicker === 'text' && singleItem && (
        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-xl flex gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                if (singleItem.type === 'text') updateItem(singleItem.id, { color: c.value });
                setActivePicker(null);
              }}
              className="w-6 h-6 rounded-md border border-black/15 transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {activePicker === 'size' && singleItem && (
        <div className="mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1.5 shadow-xl flex gap-1 animate-in fade-in zoom-in-95 duration-100">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              onClick={() => {
                if (singleItem.type === 'text') updateItem(singleItem.id, { fontSize: fs.value });
                setActivePicker(null);
              }}
              className="px-2 py-1 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {fs.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

