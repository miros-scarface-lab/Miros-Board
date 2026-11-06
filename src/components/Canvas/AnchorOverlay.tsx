import React from 'react';
import { Group, Circle } from 'react-konva';
import { BoardItem } from '../../types/board';
import { useCanvasStore } from '../../store/useCanvasStore';
import { getAllItemAnchors } from '../../utils/math';

interface Props {
  items: BoardItem[];
}

export const AnchorOverlay: React.FC<Props> = ({ items }) => {
  const hoveredAnchor = useCanvasStore((s) => s.hoveredAnchor);
  const scale = useCanvasStore((s) => s.scale);

  const radius = Math.max(5 / scale, 4);
  const activeRadius = Math.max(8 / scale, 7);

  const allAnchors = items.flatMap((item) => getAllItemAnchors(item));

  return (
    <Group listening={false}>
      {allAnchors.map((anchor, idx) => {
        const isHovered =
          hoveredAnchor &&
          hoveredAnchor.itemId === anchor.itemId &&
          hoveredAnchor.anchor === anchor.anchor;

        return (
          <Group key={`${anchor.itemId}-${anchor.anchor}-${idx}`}>
            {isHovered && (
              <Circle
                x={anchor.point.x}
                y={anchor.point.y}
                radius={activeRadius + 4}
                fill="rgba(37, 99, 235, 0.25)"
              />
            )}
            <Circle
              x={anchor.point.x}
              y={anchor.point.y}
              radius={isHovered ? activeRadius : radius}
              fill={isHovered ? '#2563EB' : '#FFFFFF'}
              stroke="#2563EB"
              strokeWidth={Math.max(1.5 / scale, 1.5)}
            />
          </Group>
        );
      })}
    </Group>
  );
};

