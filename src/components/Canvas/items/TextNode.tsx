import React, { useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { TextItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';

interface Props {
  item: TextItem;
  isSelected: boolean;
}

export const TextNode: React.FC<Props> = ({ item, isSelected }) => {
  const groupRef = useRef<Konva.Group>(null);
  const dragStartPos = useRef({ x: item.x, y: item.y });

  const activeTool = useBoardStore((s) => s.activeTool);
  const updateItem = useBoardStore((s) => s.updateItem);
  const setEditingId = useBoardStore((s) => s.setEditingId);
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

  const handleDblClick = (e: Konva.KonvaEventObject<any>) => {
    if (item.locked || isEraser) return;
    e.cancelBubble = true;
    setEditingId(item.id);
  };

  const fontStyle = [
    item.bold ? 'bold' : '',
    item.italic ? 'italic' : '',
  ]
    .filter(Boolean)
    .join(' ') || 'normal';

  return (
    <Group
      ref={groupRef}
      id={item.id}
      name="board-item"
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
      rotation={item.rotation || 0}
      draggable={!item.locked && isSelectTool}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
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
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        updateItem(item.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(50, node.width() * scaleX),
          height: Math.max(30, node.height() * scaleY),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {/* Selection / Hover border */}
      <Rect
        width={item.width}
        height={item.height}
        fill="transparent"
        stroke={isSelected ? '#0284C7' : 'transparent'}
        strokeWidth={1.5}
        dash={isSelected ? [4, 4] : undefined}
        cornerRadius={3}
      />

      <Text
        text={item.text || 'Double click to edit'}
        width={item.width}
        fontSize={item.fontSize || 24}
        fontFamily={item.fontFamily || 'Inter'}
        fontStyle={fontStyle}
        fill={item.color || '#1E293B'}
        align={item.textAlign || 'left'}
        lineHeight={1.3}
        wrap="word"
        listening={false}
        opacity={item.text ? 1 : 0.5}
      />

      {item.locked && (
        <Text
          text="🔒"
          x={item.width - 18}
          y={-14}
          fontSize={12}
          listening={false}
        />
      )}
    </Group>
  );
};
