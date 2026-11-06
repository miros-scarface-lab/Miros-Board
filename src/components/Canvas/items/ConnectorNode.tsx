import React from 'react';
import { Group, Arrow, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { ConnectorItem, BoardItem } from '../../../types/board';
import { useBoardStore } from '../../../store/useBoardStore';
import { getConnectorPoints } from '../../../utils/math';

interface Props {
  item: ConnectorItem;
  isSelected: boolean;
  itemsMap: Map<string, BoardItem>;
}

export const ConnectorNode: React.FC<Props> = ({ item, isSelected, itemsMap }) => {
  const activeTool = useBoardStore((s) => s.activeTool);
  const toggleSelect = useBoardStore((s) => s.toggleSelect);
  const deleteItem = useBoardStore((s) => s.deleteItem);

  const isEraser = activeTool === 'eraser';
  const isSelectTool = activeTool === 'select';

  const { start, end, points } = getConnectorPoints(item, itemsMap);

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

  const strokeColor = isSelected ? '#0284C7' : item.color || '#2563EB';
  const strokeW = isSelected ? item.strokeWidth + 2 : item.strokeWidth || 2;
  const pointerSize = Math.max(8, strokeW * 3.5);

  return (
    <Group
      id={item.id}
      name="board-item"
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection Glow / Hit outline */}
      {isSelected && (
        <Line
          points={points}
          stroke="rgba(2, 132, 199, 0.3)"
          strokeWidth={strokeW + 8}
          tension={item.style === 'curved' ? 0.4 : 0}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      )}

      {/* Main Arrow or Line */}
      {item.arrowEnd ? (
        <Arrow
          points={points}
          stroke={strokeColor}
          fill={strokeColor}
          strokeWidth={strokeW}
          pointerLength={pointerSize}
          pointerWidth={pointerSize}
          tension={item.style === 'curved' ? 0.4 : 0}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={Math.max(strokeW + 16, 24)}
        />
      ) : (
        <Line
          points={points}
          stroke={strokeColor}
          strokeWidth={strokeW}
          tension={item.style === 'curved' ? 0.4 : 0}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={Math.max(strokeW + 16, 24)}
        />
      )}

      {/* Optional start arrow */}
      {item.arrowStart && (
        <Arrow
          points={[points[2], points[3], points[0], points[1]]}
          stroke={strokeColor}
          fill={strokeColor}
          strokeWidth={strokeW}
          pointerLength={pointerSize}
          pointerWidth={pointerSize}
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      )}

      {/* Selected endpoints indicators */}
      {isSelected && (
        <>
          <Circle
            x={start.x}
            y={start.y}
            radius={4}
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth={2}
            listening={false}
          />
          <Circle
            x={end.x}
            y={end.y}
            radius={4}
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth={2}
            listening={false}
          />
        </>
      )}
    </Group>
  );
};
