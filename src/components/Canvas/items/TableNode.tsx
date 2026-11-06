import React, { useRef } from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import Konva from 'konva';
import { TableItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';

interface Props {
  item: TableItem;
  isSelected: boolean;
}

export const TableNode: React.FC<Props> = ({ item, isSelected }) => {
  const groupRef = useRef<Konva.Group>(null);
  const dragStartPos = useRef({ x: item.x, y: item.y });

  const activeTool = useBoardStore((s) => s.activeTool);
  const updateItem = useBoardStore((s) => s.updateItem);
  const setEditingCell = useBoardStore((s) => s.setEditingCell);
  const toggleSelect = useBoardStore((s) => s.toggleSelect);
  const deleteItem = useBoardStore((s) => s.deleteItem);

  const isEraser = activeTool === 'eraser';
  const isSelectTool = activeTool === 'select';

  const rows = Math.max(1, item.rows || 1);
  const cols = Math.max(1, item.cols || 1);
  const cellWidth = item.width / cols;
  const cellHeight = item.height / rows;

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

  const handleCellDblClick = (row: number, col: number, e: Konva.KonvaEventObject<any>) => {
    if (item.locked || isEraser) return;
    e.cancelBubble = true;
    setEditingCell({ itemId: item.id, row, col });
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
          width: Math.max(120, node.width() * scaleX),
          height: Math.max(80, node.height() * scaleY),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {/* Outer Table Card Shadow & Background */}
      <Rect
        width={item.width}
        height={item.height}
        fill={item.cellColor || '#FFFFFF'}
        cornerRadius={8}
        stroke={isSelected ? '#0284C7' : item.borderColor || '#CBD5E1'}
        strokeWidth={isSelected ? 2.5 : 1.5}
        shadowColor="rgba(0,0,0,0.08)"
        shadowBlur={isSelected ? 14 : 6}
        shadowOffset={{ x: 1, y: 3 }}
        shadowOpacity={0.6}
      />

      {/* Header Row Background */}
      <Rect
        x={0}
        y={0}
        width={item.width}
        height={cellHeight}
        fill={item.headerColor || '#F1F5F9'}
        cornerRadius={[8, 8, 0, 0]}
        listening={false}
      />

      {/* Grid Lines (Horizontal) */}
      {Array.from({ length: rows - 1 }).map((_, rIdx) => {
        const lineY = (rIdx + 1) * cellHeight;
        return (
          <Line
            key={`hline-${rIdx}`}
            points={[0, lineY, item.width, lineY]}
            stroke={item.borderColor || '#E2E8F0'}
            strokeWidth={1}
            listening={false}
          />
        );
      })}

      {/* Grid Lines (Vertical) */}
      {Array.from({ length: cols - 1 }).map((_, cIdx) => {
        const lineX = (cIdx + 1) * cellWidth;
        return (
          <Line
            key={`vline-${cIdx}`}
            points={[lineX, 0, lineX, item.height]}
            stroke={item.borderColor || '#E2E8F0'}
            strokeWidth={1}
            listening={false}
          />
        );
      })}

      {/* Cells content & interaction */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const textVal = item.cells?.[r]?.[c] || '';
          const isHeader = r === 0;
          return (
            <Group
              key={`cell-${r}-${c}`}
              x={c * cellWidth}
              y={r * cellHeight}
              width={cellWidth}
              height={cellHeight}
              onDblClick={(e) => handleCellDblClick(r, c, e)}
              onDblTap={(e) => handleCellDblClick(r, c, e)}
            >
              {/* Invisible cell hit area */}
              <Rect
                width={cellWidth}
                height={cellHeight}
                fill="transparent"
              />
              <Text
                x={8}
                y={Math.max(6, (cellHeight - 20) / 2)}
                width={Math.max(10, cellWidth - 16)}
                height={cellHeight - 12}
                text={textVal || (isHeader ? `Header ${c + 1}` : '...')}
                fontSize={isHeader ? (item.fontSize || 14) + 1 : item.fontSize || 14}
                fontStyle={isHeader ? 'bold' : 'normal'}
                fontFamily="Inter"
                fill={isHeader ? '#0F172A' : item.textColor || '#334155'}
                align="center"
                verticalAlign="middle"
                wrap="word"
                ellipsis={true}
                opacity={textVal ? 1 : 0.4}
                listening={false}
              />
            </Group>
          );
        })
      )}

      {/* Lock indicator */}
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

