import React, { useEffect, useMemo } from 'react';
import { Stage, Layer, Arrow } from 'react-konva';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import { GridLayer } from './GridLayer';
import { StickyNoteNode } from './items/StickyNoteNode';
import { ShapeNode } from './items/ShapeNode';
import { TextNode } from './items/TextNode';
import { StrokeNode } from './items/StrokeNode';
import { ConnectorNode } from './items/ConnectorNode';
import { TableNode } from './items/TableNode';
import { SelectionTransformer } from './SelectionTransformer';
import { MarqueeBox } from './MarqueeBox';
import { AnchorOverlay } from './AnchorOverlay';
import { InlineTextEditor } from './InlineTextEditor';
import { BoardItem, ConnectorItem, ShapeItem, StickyNoteItem, StrokeItem, TextItem } from '../../types/board';
import { InlineCellEditor } from './InlineCellEditor';
import { BoardItem, ConnectorItem, ShapeItem, StickyNoteItem, StrokeItem, TextItem, TableItem } from '../../types/board';

interface Props {
  stageRef?: React.RefObject<any>;
}

export const WhiteboardCanvas: React.FC<Props> = ({ stageRef: externalStageRef }) => {
  const {
    stageRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCanvasEvents();

  // Forward ref if provided
  useEffect(() => {
    if (externalStageRef && stageRef.current) {
      (externalStageRef as any).current = stageRef.current;
    }
  }, [externalStageRef, stageRef.current]);

  const items = useBoardStore((s) => s.items);
  const selectedIds = useBoardStore((s) => s.selectedIds);
  const activeTool = useBoardStore((s) => s.activeTool);
  const theme = useBoardStore((s) => s.theme);

  const {
    x,
    y,
    scale,
    width,
    height,
    isSpacePressed,
    isPanning,
    activeConnectorDraft,
    setStageSize,
  } = useCanvasStore();

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setStageSize(window.innerWidth, window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setStageSize]);

  // Index items by ID for fast connector lookups
  const itemsMap = useMemo(() => {
    const map = new Map<string, BoardItem>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  // Sort items by zIndex for correct draw order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }, [items]);

  // Dynamic cursor
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (isSpacePressed || activeTool === 'hand') return 'grab';
    if (activeTool === 'pen' || activeTool === 'connector') return 'crosshair';
    if (activeTool === 'sticky' || activeTool === 'text' || activeTool === 'shape') return 'crosshair';
    if (activeTool === 'sticky' || activeTool === 'text' || activeTool === 'shape' || activeTool === 'table') return 'crosshair';
    if (activeTool === 'eraser') return 'pointer';
    return 'default';
  };

  const bgColor = theme === 'dark' ? '#18181B' : '#F8FAFC';

  return (
    <div
      className="canvas-container relative w-full h-full select-none overflow-hidden"
      style={{
        backgroundColor: bgColor,
        cursor: getCursor(),
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        x={x}
        y={y}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Layer 1: Infinite Dot Grid */}
        <GridLayer />

        {/* Layer 2: Canvas Elements */}
        <Layer>
          {sortedItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            switch (item.type) {
              case 'sticky':
                return (
                  <StickyNoteNode
                    key={item.id}
                    item={item as StickyNoteItem}
                    isSelected={isSelected}
                  />
                );
              case 'shape':
                return (
                  <ShapeNode
                    key={item.id}
                    item={item as ShapeItem}
                    isSelected={isSelected}
                  />
                );
              case 'text':
                return (
                  <TextNode
                    key={item.id}
                    item={item as TextItem}
                    isSelected={isSelected}
                  />
                );
              case 'stroke':
                return (
                  <StrokeNode
                    key={item.id}
                    item={item as StrokeItem}
                    isSelected={isSelected}
                  />
                );
              case 'connector':
                return (
                  <ConnectorNode
                    key={item.id}
                    item={item as ConnectorItem}
                    isSelected={isSelected}
                    itemsMap={itemsMap}
                  />
                );
              case 'table':
                return (
                  <TableNode
                    key={item.id}
                    item={item as TableItem}
                    isSelected={isSelected}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Active Connector Preview while user is dragging */}
          {activeConnectorDraft && (
            <Arrow
              points={[
                activeConnectorDraft.startPoint.x,
                activeConnectorDraft.startPoint.y,
                activeConnectorDraft.currentPoint.x,
                activeConnectorDraft.currentPoint.y,
              ]}
              stroke="#2563EB"
              fill="#2563EB"
              strokeWidth={2}
              dash={[6, 4]}
              pointerLength={10}
              pointerWidth={10}
              listening={false}
            />
          )}

          {/* Anchor Points Overlay (visible during connector tool) */}
          {activeTool === 'connector' && <AnchorOverlay items={items} />}
        </Layer>

        {/* Layer 3: Selection Transformer & Marquee */}
        <Layer name="transformer-layer">
          <SelectionTransformer selectedIds={selectedIds} />
          <MarqueeBox />
        </Layer>
      </Stage>

      {/* Screen-space HTML Textarea overlay for inline text editing */}
      <InlineTextEditor />

      {/* Screen-space HTML Input overlay for table cell editing */}
      <InlineCellEditor />
    </div>
  );
};
