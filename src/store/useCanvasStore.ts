import { create } from 'zustand';
import { Point, Rect, MarqueeSelection, AnchorPoint } from '../types/canvas';
import { AnchorPosition } from '../types/board';

interface CanvasState {
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  isSpacePressed: boolean;
  isPanning: boolean;
  marquee: MarqueeSelection;
  hoveredAnchor: AnchorPoint | null;
  activeConnectorDraft: {
    fromId?: string;
    fromAnchor?: AnchorPosition;
    startPoint: Point;
    currentPoint: Point;
  } | null;

  // Actions
  setStageSize: (width: number, height: number) => void;
  setViewport: (x: number, y: number, scale: number) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (clientX: number, clientY: number, delta: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomPercent: (percent: number) => void;
  resetZoom: () => void;
  zoomToFit: (bounds: Rect | null) => void;
  setIsSpacePressed: (pressed: boolean) => void;
  setIsPanning: (isPanning: boolean) => void;
  setMarquee: (marquee: Partial<MarqueeSelection>) => void;
  resetMarquee: () => void;
  setHoveredAnchor: (anchor: AnchorPoint | null) => void;
  setActiveConnectorDraft: (draft: CanvasState['activeConnectorDraft']) => void;
  screenToCanvas: (screen: Point) => Point;
  canvasToScreen: (canvas: Point) => Point;
}

const MIN_SCALE = 0.1; // 10%
const MAX_SCALE = 4.0; // 400%
const ZOOM_STEP = 1.2;

export const useCanvasStore = create<CanvasState>((set, get) => ({
  x: 0,
  y: 0,
  scale: 1,
  width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  height: typeof window !== 'undefined' ? window.innerHeight : 800,
  isSpacePressed: false,
  isPanning: false,
  marquee: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  },
  hoveredAnchor: null,
  activeConnectorDraft: null,

  setStageSize: (width, height) => set({ width, height }),

  setViewport: (x, y, scale) => {
    const clampedScale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
    set({ x, y, scale: clampedScale });
  },

  panBy: (dx, dy) => {
    set((state) => ({
      x: state.x + dx,
      y: state.y + dy,
    }));
  },

  zoomAt: (clientX, clientY, delta) => {
    const { x, y, scale } = get();
    // delta < 0 means zoom in, delta > 0 means zoom out
    const factor = delta < 0 ? 1.1 : 0.909;
    const newScale = Math.min(Math.max(scale * factor, MIN_SCALE), MAX_SCALE);
    if (newScale === scale) return;

    // Zoom centered at cursor clientX, clientY
    const mousePointTo = {
      x: (clientX - x) / scale,
      y: (clientY - y) / scale,
    };

    const newPos = {
      x: clientX - mousePointTo.x * newScale,
      y: clientY - mousePointTo.y * newScale,
    };

    set({
      x: newPos.x,
      y: newPos.y,
      scale: newScale,
    });
  },

  zoomIn: () => {
    const { x, y, scale, width, height } = get();
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.min(scale * ZOOM_STEP, MAX_SCALE);

    const mousePointTo = {
      x: (centerX - x) / scale,
      y: (centerY - y) / scale,
    };

    set({
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
      scale: newScale,
    });
  },

  zoomOut: () => {
    const { x, y, scale, width, height } = get();
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.max(scale / ZOOM_STEP, MIN_SCALE);

    const mousePointTo = {
      x: (centerX - x) / scale,
      y: (centerY - y) / scale,
    };

    set({
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
      scale: newScale,
    });
  },

  setZoomPercent: (percent) => {
    const targetScale = Math.min(Math.max(percent / 100, MIN_SCALE), MAX_SCALE);
    const { x, y, scale, width, height } = get();
    const centerX = width / 2;
    const centerY = height / 2;

    const mousePointTo = {
      x: (centerX - x) / scale,
      y: (centerY - y) / scale,
    };

    set({
      x: centerX - mousePointTo.x * targetScale,
      y: centerY - mousePointTo.y * targetScale,
      scale: targetScale,
    });
  },

  resetZoom: () => {
    get().setZoomPercent(100);
  },

  zoomToFit: (bounds) => {
    const { width, height } = get();
    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      set({ x: width / 4, y: height / 4, scale: 1 });
      return;
    }

    const padding = 100;
    const availableWidth = Math.max(width - padding * 2, 200);
    const availableHeight = Math.max(height - padding * 2, 200);

    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_SCALE), 1.5);

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    set({
      x: width / 2 - centerX * fitScale,
      y: height / 2 - centerY * fitScale,
      scale: fitScale,
    });
  },

  setIsSpacePressed: (isSpacePressed) => set({ isSpacePressed }),
  setIsPanning: (isPanning) => set({ isPanning }),

  setMarquee: (marquee) => {
    set((state) => ({
      marquee: { ...state.marquee, ...marquee },
    }));
  },

  resetMarquee: () => {
    set({
      marquee: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      },
    });
  },

  setHoveredAnchor: (hoveredAnchor) => set({ hoveredAnchor }),
  setActiveConnectorDraft: (activeConnectorDraft) => set({ activeConnectorDraft }),

  screenToCanvas: (screen) => {
    const { x, y, scale } = get();
    return {
      x: (screen.x - x) / scale,
      y: (screen.y - y) / scale,
    };
  },

  canvasToScreen: (canvas) => {
    const { x, y, scale } = get();
    return {
      x: canvas.x * scale + x,
      y: canvas.y * scale + y,
    };
  },
}));

