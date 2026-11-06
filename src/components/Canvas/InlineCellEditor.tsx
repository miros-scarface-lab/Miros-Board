import React, { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { TableItem } from '../../types/board';

export const InlineCellEditor: React.FC = () => {
  const editingCell = useBoardStore((s) => s.editingCell);
  const items = useBoardStore((s) => s.items);
  const updateTableCell = useBoardStore((s) => s.updateTableCell);
  const setEditingCell = useBoardStore((s) => s.setEditingCell);

  const canvasToScreen = useCanvasStore((s) => s.canvasToScreen);
  const scale = useCanvasStore((s) => s.scale);

  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');

  const table = items.find((i) => i.id === editingCell?.itemId && i.type === 'table') as TableItem | undefined;

  useEffect(() => {
    if (table && editingCell) {
      const currentVal = table.cells?.[editingCell.row]?.[editingCell.col] || '';
      setText(currentVal);
    }
  }, [table?.id, editingCell?.row, editingCell?.col]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  if (!editingCell || !table) return null;

  const cellWidth = table.width / Math.max(1, table.cols);
  const cellHeight = table.height / Math.max(1, table.rows);

  const cellX = table.x + editingCell.col * cellWidth;
  const cellY = table.y + editingCell.row * cellHeight;

  const screenPos = canvasToScreen({ x: cellX, y: cellY });
  const screenW = cellWidth * scale;
  const screenH = cellHeight * scale;

  const handleCommit = () => {
    updateTableCell(table.id, editingCell.row, editingCell.col, text);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setEditingCell(null);
      return;
    }
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleCommit();
      return;
    }
    e.stopPropagation();
  };

  return (
    <div
      className="absolute pointer-events-auto z-40"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        width: `${screenW}px`,
        height: `${screenH}px`,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className="w-full h-full bg-white dark:bg-neutral-800 border-2 border-blue-500 rounded px-2 text-center text-neutral-900 dark:text-neutral-100 outline-none shadow-md font-sans text-xs"
        style={{
          fontSize: `${Math.max(11, (table.fontSize || 14) * scale)}px`,
        }}
      />
    </div>
  );
};

