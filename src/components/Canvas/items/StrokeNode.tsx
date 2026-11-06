import React, { useRef } from 'react';
import { Group, Line } from 'react-konva';
import Konva from 'konva';
import { StrokeItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';

interface Props {
  item: StrokeItem;
  isSelected: boolean;
}

export const StrokeNode: React.FC<Props> = ({ item, isSelected }) => {
  const lineRef = useRef<Konva.Line>(null);
  const dragStartPos = useRef({ x: item.x, y: item.y });

  const activeTool = useBoardStore((s) => s.activeTool);
  const updateItem = useBoardStore((s) => s.updateItem);
  const toggleSelect = useBoardStore((s) => s.toggleSelect);
  const deleteItem = useBoardStore((s) => s.deleteItem);

  const isEraser = activeTool === 'eraser';
  const isSelectTool = activeTool === 'select';

  const handleClick = (e: Konva.KonvaEventObject<any>) => {
    if (isEraser) {
      deleteItem(item.id);
      return;
    }
    if (isSelectTool) {
      e.cancelBubble = true;
      toggleSelect(item.id, e.evt?.shiftKey ?? false);
    }
  };

  return (
    <Group
      id={item.id}
      name="board-item"
      x={item.x}
      y={item.y}
      draggable={!item.locked && isSelectTool}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={(e) => {
        dragStartPos.current = { x: e.target.x(), y: e.target.y() };
      }}
      onDragMove={(e) => {
        const newX = e.target.x();
        const newY = e.target.y();
        const dx = newX - dragStartPos.current.x;
        const dy = newY - dragStartPos.current.y;
        dragStartPos.current = { x: newX, y: newY };

        const { selectedIds, updateItems } = useBoardStore.getState();
        if (selectedIds.includes(item.id) && selectedIds.length > 1) {
          const updates = selectedIds
            .filter((id) => id !== item.id)
            .map((id) => {
              const other = useBoardStore.getState().items.find((it) => it.id === id);
              return other ? { id, partial: { x: other.x + dx, y: other.y + dy } } : null;
            })
            .filter(Boolean) as { id: string; partial: Partial<BoardItem> }[];
          updateItems(updates, false);
        }

        updateItem(item.id, { x: newX, y: newY }, false);
      }}
      onDragEnd={(e) => {
        useBoardStore.getState().recordHistory();
        updateItem(item.id, {
          x: e.target.x(),
          y: e.target.y(),
        }, false);
      }}
    >
      <Line
        ref={lineRef}
        points={item.points}
        stroke={isSelected ? '#0284C7' : item.color || '#1E293B'}
        strokeWidth={isSelected ? item.strokeWidth + 2 : item.strokeWidth || 4}
        tension={item.tension ?? 0.4}
        lineCap="round"
        lineJoin="round"
        shadowColor={isSelected ? 'rgba(2, 132, 199, 0.4)' : undefined}
        shadowBlur={isSelected ? 6 : 0}
        hitStrokeWidth={Math.max(item.strokeWidth + 12, 16)}
      />
    </Group>
  );
};
