import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { useBoardStore } from '../../store/useBoardStore';

interface Props {
  selectedIds: string[];
}

export const SelectionTransformer: React.FC<Props> = ({ selectedIds }) => {
  const trRef = useRef<Konva.Transformer>(null);
  const items = useBoardStore((s) => s.items);

  useEffect(() => {
    if (!trRef.current) return;
    const stage = trRef.current.getStage();
    if (!stage) return;

    // Filter out connectors and locked items from transformer
    const selectedNodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const item = items.find((i) => i.id === id);
      if (!item || item.type === 'connector' || item.locked) continue;

      const node = stage.findOne('#' + id);
      if (node) {
        selectedNodes.push(node);
      }
    }

    trRef.current.nodes(selectedNodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds, items]);

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={trRef}
      name="selection-transformer"
      borderStroke="#0284C7"
      borderStrokeWidth={1.5}
      anchorFill="#FFFFFF"
      anchorStroke="#0284C7"
      anchorStrokeWidth={1.5}
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={20}
      boundBoxFunc={(oldBox, newBox) => {
        // Enforce minimum dimension
        if (Math.abs(newBox.width) < 15 || Math.abs(newBox.height) < 15) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
};

