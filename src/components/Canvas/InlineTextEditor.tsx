import React, { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';

export const InlineTextEditor: React.FC = () => {
  const editingId = useBoardStore((s) => s.editingId);
  const items = useBoardStore((s) => s.items);
  const updateItem = useBoardStore((s) => s.updateItem);
  const setEditingId = useBoardStore((s) => s.setEditingId);

  const canvasToScreen = useCanvasStore((s) => s.canvasToScreen);
  const scale = useCanvasStore((s) => s.scale);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const item = items.find((i) => i.id === editingId);

  const [text, setText] = useState('');

  useEffect(() => {
    if (item) {
      if (item.type === 'sticky' || item.type === 'text' || item.type === 'shape') {
        setText(item.text || '');
      }
    }
  }, [item?.id]);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  if (!editingId || !item) return null;

  const screenPos = canvasToScreen({ x: item.x, y: item.y });
  const width = Math.max(80, item.width * scale);
  const height = Math.max(40, item.height * scale);

  const handleCommit = () => {
    if (item.type === 'sticky' || item.type === 'text' || item.type === 'shape') {
      updateItem(item.id, { text });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setEditingId(null);
      return;
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.stopPropagation();
      handleCommit();
      return;
    }
    e.stopPropagation(); // Prevent trigger of board hotkeys
  };

  const fontSize = (
    item.type === 'sticky' ? (item.fontSize || 16) :
    item.type === 'shape' ? (item.fontSize || 16) :
    item.type === 'text' ? (item.fontSize || 24) : 16
  ) * scale;

  const isSticky = item.type === 'sticky';
  const isShape = item.type === 'shape';

  const getTextColor = () => {
    if (item.type === 'sticky') return item.textColor || '#1F2937';
    if (item.type === 'shape') return item.textColor || '#1E293B';
    if (item.type === 'text') return item.color || '#1E293B';
    return '#1E293B';
  };

  const getTextAlign = () => {
    if (item.type === 'shape') return 'center';
    if (item.type === 'sticky' || item.type === 'text') return item.textAlign || 'left';
    return 'left';
  };

  return (
    <div
      className="absolute pointer-events-auto z-40"
      style={{
        left: screenPos.x,
        top: screenPos.y,
        width: `${width}px`,
        height: `${height}px`,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
        transformOrigin: '0 0',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        placeholder="Type here..."
        className={`w-full h-full resize-none border-2 border-blue-500 rounded outline-none p-2 leading-tight ${
          isSticky
            ? 'bg-transparent text-neutral-800'
            : isShape
            ? 'bg-transparent text-center flex items-center justify-center text-neutral-900'
            : 'bg-transparent text-neutral-900'
        }`}
        style={{
          fontSize: `${Math.max(12, fontSize)}px`,
          fontFamily: 'Inter, sans-serif',
          textAlign: getTextAlign(),
          color: getTextColor(),
        }}
      />
    </div>
  );
};
