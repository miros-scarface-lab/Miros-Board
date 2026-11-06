import { AnchorPosition } from './board';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface MarqueeSelection {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface AnchorPoint {
  itemId: string;
  anchor: AnchorPosition;
  point: Point;
}

