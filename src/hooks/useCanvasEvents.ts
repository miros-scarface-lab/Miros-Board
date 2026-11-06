import { useRef, useCallback } from 'react';
import Konva from 'konva';
import { useBoardStore } from '../store/useBoardStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { StickyNoteItem, ShapeItem, TextItem, StrokeItem, ConnectorItem } from '../types/board';
import {
  StickyNoteItem,
  ShapeItem,
  TextItem,
  StrokeItem,
  ConnectorItem,
  TableItem,
} from '../types/board';
import { findNearestAnchor, rectIntersects, getItemBounds } from '../utils/math';
import { detectShapeFromStroke } from '../utils/shapeRecognition';
import { Point } from '../types/canvas';

export function useCanvasEvents() {
  const stageRef = useRef<Konva.Stage>(null);

  const {
    items,
    activeTool,
    setActiveTool,
    toolSettings,
    addItem,
    deleteItem,
    clearSelection,
    setSelectedIds,
    setEditingId,
  } = useBoardStore();

  const {
    x: stageX,
    y: stageY,
    scale,
    isSpacePressed,
    isPanning,
    panBy,
    zoomAt,
    setIsPanning,
    setMarquee,
    resetMarquee,
    setHoveredAnchor,
    setActiveConnectorDraft,
    activeConnectorDraft,
  } = useCanvasStore();

  const isDrawingPenRef = useRef(false);
  const currentStrokeRef = useRef<StrokeItem | null>(null);

  const isDraggingConnectorRef = useRef(false);
  const isMarqueeRef = useRef(false);
  const marqueeStartRef = useRef<Point>({ x: 0, y: 0 });

  const lastPointerPosRef = useRef<Point>({ x: 0, y: 0 });

  // Get pointer coordinate in canvas virtual space
  const getCanvasPointer = useCallback((): Point => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return {
      x: (pointer.x - stageX) / scale,
      y: (pointer.y - stageY) / scale,
    };
  }, [stageX, stageY, scale]);

  // Wheel handling for Pan & Zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition() || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Zoom toward pointer
        zoomAt(pointer.x, pointer.y, e.evt.deltaY);
      } else {
        // Two-finger scroll or mouse wheel pan
        panBy(-e.evt.deltaX, -e.evt.deltaY);
      }
    },
    [zoomAt, panBy]
  );

  // Pointer Down
  const handlePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const evt = e.evt;
      const pointer = stage.getPointerPosition() || { x: 0, y: 0 };
      lastPointerPosRef.current = pointer;

      // Middle click or Space + drag or Hand tool -> Pan
      if (evt.button === 1 || isSpacePressed || activeTool === 'hand') {
        setIsPanning(true);
        return;
      }

      const canvasPos = getCanvasPointer();
      const isClickedOnEmpty = e.target === stage || e.target.hasName('grid-layer');

      // ERASER TOOL
      if (activeTool === 'eraser') {
        return; // Handled per-item click/tap
        return;
      }

      // STICKY NOTE TOOL
      if (activeTool === 'sticky') {
        const id = `sticky-${Date.now()}`;
        const newSticky: StickyNoteItem = {
          id,
          type: 'sticky',
          x: Math.round(canvasPos.x - 100),
          y: Math.round(canvasPos.y - 100),
          width: 200,
          height: 200,
          rotation: 0,
          zIndex: items.length + 1,
          locked: false,
          color: toolSettings.stickyColor,
          text: '',
          fontSize: 16,
          fontFamily: 'Inter',
          textAlign: 'left',
          textColor: '#1F2937',
        };
        addItem(newSticky);
        setEditingId(id);
        setActiveTool('select');
        return;
      }

      // TEXT TOOL
      if (activeTool === 'text') {
        const id = `text-${Date.now()}`;
        const newText: TextItem = {
          id,
          type: 'text',
          x: Math.round(canvasPos.x),
          y: Math.round(canvasPos.y - 15),
          width: 180,
          height: 40,
          rotation: 0,
          zIndex: items.length + 1,
          locked: false,
          text: '',
          fontSize: toolSettings.textSize,
          fontFamily: 'Inter',
          color: toolSettings.textColor,
          textAlign: 'left',
        };
        addItem(newText);
        setEditingId(id);
        setActiveTool('select');
        return;
      }

      // SHAPE TOOL
      if (activeTool === 'shape') {
        const id = `shape-${Date.now()}`;
        const newShape: ShapeItem = {
          id,
          type: 'shape',
          shapeType: toolSettings.shapeType,
          x: Math.round(canvasPos.x - 90),
          y: Math.round(canvasPos.y - 60),
          width: 180,
          height: 120,
          rotation: 0,
          zIndex: items.length + 1,
          locked: false,
          fill: toolSettings.shapeFill,
          stroke: toolSettings.shapeStroke,
          strokeWidth: toolSettings.shapeStrokeWidth,
          strokeStyle: 'solid',
          text: '',
        };
        addItem(newShape);
        setActiveTool('select');
        return;
      }

      // TABLE / MATRIX TOOL
      if (activeTool === 'table') {
        const id = `table-${Date.now()}`;
        const rows = toolSettings.tableRows || 3;
        const cols = toolSettings.tableCols || 3;
        const initialCells: string[][] = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (r === 0 ? `Col ${c + 1}` : ''))
        );

        const newTable: TableItem = {
          id,
          type: 'table',
          x: Math.round(canvasPos.x - 180),
          y: Math.round(canvasPos.y - 90),
          width: 360,
          height: 180,
          rotation: 0,
          zIndex: items.length + 1,
          locked: false,
          title: 'Matrix',
          rows,
          cols,
          cells: initialCells,
          headerColor: toolSettings.tableHeaderColor || '#F1F5F9',
          cellColor: '#FFFFFF',
          borderColor: '#CBD5E1',
          textColor: '#1E293B',
          fontSize: 14,
        };
        addItem(newTable);
        setActiveTool('select');
        return;
      }

      // PEN TOOL
      if (activeTool === 'pen') {
        isDrawingPenRef.current = true;
        const id = `stroke-${Date.now()}`;
        const newStroke: StrokeItem = {
          id,
          type: 'stroke',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          rotation: 0,
          zIndex: items.length + 1,
          locked: false,
          points: [canvasPos.x, canvasPos.y],
          color: toolSettings.penColor,
          strokeWidth: toolSettings.penWidth,
          tension: 0.4,
        };
        currentStrokeRef.current = newStroke;
        addItem(newStroke, false);
        return;
      }

      // CONNECTOR TOOL
      if (activeTool === 'connector') {
        if (!activeConnectorDraft) {
          // First click or start drag
          isDraggingConnectorRef.current = true;
          const nearestAnchor = findNearestAnchor(canvasPos, items, undefined, 30);
          const startPoint = nearestAnchor ? nearestAnchor.point : canvasPos;

          setActiveConnectorDraft({
            fromId: nearestAnchor?.itemId,
            fromAnchor: nearestAnchor?.anchor,
            startPoint,
            currentPoint: canvasPos,
          });
        } else {
          // Second click completes connector
          const nearestAnchor = findNearestAnchor(
            canvasPos,
            items,
            activeConnectorDraft.fromId,
            30
          );
          const endPoint = nearestAnchor ? nearestAnchor.point : canvasPos;

          const dist = Math.hypot(
          const distVal = Math.hypot(
            endPoint.x - activeConnectorDraft.startPoint.x,
            endPoint.y - activeConnectorDraft.startPoint.y
          );

          if (dist > 15) {
          if (distVal > 15) {
            const id = `connector-${Date.now()}`;
            const newConnector: ConnectorItem = {
              id,
              type: 'connector',
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              rotation: 0,
              zIndex: items.length + 1,
              locked: false,
              fromId: activeConnectorDraft.fromId,
              fromAnchor: activeConnectorDraft.fromAnchor,
              toId: nearestAnchor?.itemId,
              toAnchor: nearestAnchor?.anchor,
              startPoint: activeConnectorDraft.startPoint,
              endPoint,
              style: toolSettings.connectorStyle,
              color: toolSettings.connectorColor,
              strokeWidth: toolSettings.connectorWidth,
              arrowStart: false,
              arrowEnd: toolSettings.connectorArrowEnd,
            };
            addItem(newConnector);
          }

          setActiveConnectorDraft(null);
          setHoveredAnchor(null);
          setActiveTool('select');
          isDraggingConnectorRef.current = false;
        }
        return;
      }

      // SELECT TOOL - Marquee selection on empty canvas
      if (activeTool === 'select' && isClickedOnEmpty) {
        clearSelection();
        isMarqueeRef.current = true;
        marqueeStartRef.current = canvasPos;
        setMarquee({
          active: true,
          startX: canvasPos.x,
          startY: canvasPos.y,
          currentX: canvasPos.x,
          currentY: canvasPos.y,
        });
      }
    },
    [
      activeTool,
      items,
      isSpacePressed,
      toolSettings,
      activeConnectorDraft,
      getCanvasPointer,
      addItem,
      clearSelection,
      setActiveTool,
      setEditingId,
      setIsPanning,
      setMarquee,
      setActiveConnectorDraft,
      setHoveredAnchor,
    ]
  );

  // Pointer Move
  const handlePointerMove = useCallback(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition() || { x: 0, y: 0 };
      const dx = pointer.x - lastPointerPosRef.current.x;
      const dy = pointer.y - lastPointerPosRef.current.y;
      lastPointerPosRef.current = pointer;

      // Panning active
      if (isPanning) {
        panBy(dx, dy);
        return;
      }

      const canvasPos = getCanvasPointer();

      // PEN DRAWING
      if (isDrawingPenRef.current && currentStrokeRef.current) {
        const stroke = currentStrokeRef.current;
        const newPoints = [...stroke.points, canvasPos.x, canvasPos.y];
        stroke.points = newPoints;
        useBoardStore.getState().updateItem(stroke.id, { points: newPoints }, false);
        return;
      }

      // CONNECTOR HOVER / DRAFTING
      if (activeTool === 'connector') {
        const draft = useCanvasStore.getState().activeConnectorDraft;
        const nearestAnchor = findNearestAnchor(
          canvasPos,
          items,
          draft?.fromId,
          30
        );
        setHoveredAnchor(nearestAnchor);

        if (draft) {
          const endPoint = nearestAnchor ? nearestAnchor.point : canvasPos;
          setActiveConnectorDraft({
            ...draft,
            currentPoint: endPoint,
          });
        }
        return;
      }

      // MARQUEE SELECTION
      if (isMarqueeRef.current) {
        setMarquee({
          currentX: canvasPos.x,
          currentY: canvasPos.y,
        });
      }
    },
    [
      isPanning,
      activeTool,
      items,
      panBy,
      getCanvasPointer,
      setHoveredAnchor,
      setActiveConnectorDraft,
      setMarquee,
    ]
  );

  // Pointer Up
  const handlePointerUp = useCallback(() => {
    // End Panning
    if (isPanning) {
      setIsPanning(false);
    }

    // End Pen Drawing
    // End Pen Drawing with Smart Shape Recognition
    if (isDrawingPenRef.current) {
      isDrawingPenRef.current = false;
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = null;

      if (stroke && toolSettings.smartDrawing && stroke.points.length >= 10) {
        const detected = detectShapeFromStroke(stroke.points);

        if (detected) {
          // Remove raw stroke
          deleteItem(stroke.id);

          if (detected.type === 'line') {
            const newConn: ConnectorItem = {
              id: `connector-${Date.now()}`,
              type: 'connector',
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              rotation: 0,
              zIndex: items.length + 1,
              locked: false,
              startPoint: detected.start,
              endPoint: detected.end,
              style: 'straight',
              color: stroke.color,
              strokeWidth: stroke.strokeWidth,
              arrowStart: false,
              arrowEnd: true,
            };
            addItem(newConn);
          } else if (detected.type === 'ellipse') {
            const newShape: ShapeItem = {
              id: `shape-${Date.now()}`,
              type: 'shape',
              shapeType: 'ellipse',
              x: Math.round(detected.x),
              y: Math.round(detected.y),
              width: Math.round(detected.width),
              height: Math.round(detected.height),
              rotation: 0,
              zIndex: items.length + 1,
              locked: false,
              fill: 'transparent',
              stroke: stroke.color,
              strokeWidth: stroke.strokeWidth,
              strokeStyle: 'solid',
            };
            addItem(newShape);
          } else if (detected.type === 'rectangle') {
            const newShape: ShapeItem = {
              id: `shape-${Date.now()}`,
              type: 'shape',
              shapeType: detected.isSquare ? 'rectangle' : 'rounded-rectangle',
              x: Math.round(detected.x),
              y: Math.round(detected.y),
              width: Math.round(detected.width),
              height: Math.round(detected.height),
              rotation: 0,
              zIndex: items.length + 1,
              locked: false,
              fill: 'transparent',
              stroke: stroke.color,
              strokeWidth: stroke.strokeWidth,
              strokeStyle: 'solid',
            };
            addItem(newShape);
          } else if (detected.type === 'triangle') {
            const newShape: ShapeItem = {
              id: `shape-${Date.now()}`,
              type: 'shape',
              shapeType: 'triangle',
              x: Math.round(detected.x),
              y: Math.round(detected.y),
              width: Math.round(detected.width),
              height: Math.round(detected.height),
              rotation: 0,
              zIndex: items.length + 1,
              locked: false,
              fill: 'transparent',
              stroke: stroke.color,
              strokeWidth: stroke.strokeWidth,
              strokeStyle: 'solid',
            };
            addItem(newShape);
          }
          return;
        }
      }

      useBoardStore.getState().recordHistory();
    }

    // End Connector Drag (if dragged more than 20px)
    // End Connector Drag
    if (isDraggingConnectorRef.current) {
      isDraggingConnectorRef.current = false;
      const draft = useCanvasStore.getState().activeConnectorDraft;
      if (draft) {
        const canvasPos = getCanvasPointer();
        const nearestAnchor = findNearestAnchor(
          canvasPos,
          items,
          draft.fromId,
          30
        );
        const endPoint = nearestAnchor ? nearestAnchor.point : canvasPos;

        const dist = Math.hypot(
        const distVal = Math.hypot(
          endPoint.x - draft.startPoint.x,
          endPoint.y - draft.startPoint.y
        );

        // If the user actually dragged a distance, finish it now
        if (dist > 25) {
        if (distVal > 25) {
          const id = `connector-${Date.now()}`;
          const newConnector: ConnectorItem = {
            id,
            type: 'connector',
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            zIndex: items.length + 1,
            locked: false,
            fromId: draft.fromId,
            fromAnchor: draft.fromAnchor,
            toId: nearestAnchor?.itemId,
            toAnchor: nearestAnchor?.anchor,
            startPoint: draft.startPoint,
            endPoint,
            style: toolSettings.connectorStyle,
            color: toolSettings.connectorColor,
            strokeWidth: toolSettings.connectorWidth,
            arrowStart: false,
            arrowEnd: toolSettings.connectorArrowEnd,
          };
          addItem(newConnector);
          setActiveConnectorDraft(null);
          setHoveredAnchor(null);
          setActiveTool('select');
        }
        // If dist <= 25, it was just a click! Keep draft alive so second click completes it!
      }
    }

    // End Marquee Selection
    if (isMarqueeRef.current) {
      isMarqueeRef.current = false;
      const { marquee } = useCanvasStore.getState();
      const selBox = {
        x: Math.min(marquee.startX, marquee.currentX),
        y: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
      };

      if (selBox.width > 5 || selBox.height > 5) {
        const matchingIds = items
          .filter((item) => rectIntersects(getItemBounds(item), selBox))
          .map((item) => item.id);
        setSelectedIds(matchingIds);
      }
      resetMarquee();
    }
  }, [
    isPanning,
    items,
    toolSettings,
    getCanvasPointer,
    addItem,
    deleteItem,
    setIsPanning,
    setActiveConnectorDraft,
    setHoveredAnchor,
    setActiveTool,
    setSelectedIds,
    resetMarquee,
  ]);

  return {
    stageRef,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
