import React, { useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { StickyNoteItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';

interface Props {
  item: StickyNoteItem;
  isSelected: boolean;
}

export const StickyNoteNode: React.FC<Props> = ({ item, isSelected }) => {
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
          width: Math.max(80, node.width() * scaleX),
          height: Math.max(80, node.height() * scaleY),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {/* Sticky Note Body with drop shadow */}
      <Rect
        width={item.width}
        height={item.height}
        fill={item.color}
        cornerRadius={4}
        shadowColor="rgba(0,0,0,0.18)"
        shadowBlur={isSelected ? 14 : 8}
        shadowOffset={{ x: 2, y: 4 }}
        shadowOpacity={0.6}
        stroke={isSelected ? '#0284C7' : 'transparent'}
        strokeWidth={isSelected ? 2 : 0}
      />

      {/* Text Inside Note */}
      <Text
        text={item.text || 'Type something...'}
        width={item.width - 24}
        height={item.height - 24}
        x={12}
        y={12}
        fontSize={item.fontSize || 16}
        fontFamily={item.fontFamily || 'Inter'}
        fill={item.textColor || '#1F2937'}
        align={item.textAlign || 'left'}
        lineHeight={1.3}
        wrap="word"
        ellipsis={true}
        listening={false}
        opacity={item.text ? 1 : 0.4}
      />

      {/* Lock indicator if locked */}
      {item.locked && (
        <Text
          text="🔒"
          x={item.width - 26}
          y={6}
          fontSize={14}
          listening={false}
        />
      )}
    </Group>
  );
};
