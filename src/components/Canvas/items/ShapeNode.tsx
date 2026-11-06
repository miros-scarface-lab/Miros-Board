import React, { useRef } from 'react';
import { Group, Rect, Ellipse, Line, Text } from 'react-konva';
import Konva from 'konva';
import { ShapeItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';

interface Props {
  item: ShapeItem;
  isSelected: boolean;
}

export const ShapeNode: React.FC<Props> = ({ item, isSelected }) => {
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

  const strokeProps = {
    stroke: isSelected ? '#0284C7' : item.stroke || '#2563EB',
    strokeWidth: isSelected ? Math.max(item.strokeWidth, 2.5) : item.strokeWidth || 2,
    dash: item.strokeStyle === 'dashed' ? [8, 6] : undefined,
    fill: item.fill || '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowBlur: isSelected ? 8 : 4,
    shadowOffset: { x: 1, y: 2 },
    shadowOpacity: 0.4,
  };

  const renderShapeGeometry = () => {
    const w = Math.max(20, item.width);
    const h = Math.max(20, item.height);

    switch (item.shapeType) {
      case 'rectangle':
        return <Rect width={w} height={h} cornerRadius={0} {...strokeProps} />;
      case 'rounded-rectangle':
        return <Rect width={w} height={h} cornerRadius={12} {...strokeProps} />;
      case 'ellipse':
        return (
          <Ellipse
            x={w / 2}
            y={h / 2}
            radiusX={w / 2}
            radiusY={h / 2}
            {...strokeProps}
          />
        );
      case 'triangle':
        return (
          <Line
            points={[w / 2, 0, w, h, 0, h]}
            closed={true}
            {...strokeProps}
          />
        );
      case 'diamond':
        return (
          <Line
            points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]}
            closed={true}
            {...strokeProps}
          />
        );
      default:
        return <Rect width={w} height={h} {...strokeProps} />;
    }
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
          width: Math.max(40, node.width() * scaleX),
          height: Math.max(40, node.height() * scaleY),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {renderShapeGeometry()}

      {/* Optional shape text */}
      {item.text && (
        <Text
          text={item.text}
          x={10}
          y={10}
          width={Math.max(20, item.width - 20)}
          height={Math.max(20, item.height - 20)}
          align="center"
          verticalAlign="middle"
          fontSize={item.fontSize || 16}
          fontFamily="Inter"
          fill={item.textColor || '#1E293B'}
          wrap="word"
          listening={false}
        />
      )}

      {item.locked && (
        <Text
          text="🔒"
          x={item.width - 24}
          y={6}
          fontSize={14}
          listening={false}
        />
      )}
    </Group>
  );
};
