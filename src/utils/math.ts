import { BoardItem, AnchorPosition } from '../types/board';
import { Point, Rect, AnchorPoint } from '../types/canvas';

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function rotatePoint(p: Point, center: Point, angleDeg: number): Point {
  if (!angleDeg) return p;
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export function getItemAnchorPoint(item: BoardItem, anchor: AnchorPosition): Point {
  const center = {
    x: item.x + item.width / 2,
    y: item.y + item.height / 2,
  };

  let unrotatedPoint: Point;
  switch (anchor) {
    case 'top':
      unrotatedPoint = { x: item.x + item.width / 2, y: item.y };
      break;
    case 'right':
      unrotatedPoint = { x: item.x + item.width, y: item.y + item.height / 2 };
      break;
    case 'bottom':
      unrotatedPoint = { x: item.x + item.width / 2, y: item.y + item.height };
      break;
    case 'left':
      unrotatedPoint = { x: item.x, y: item.y + item.height / 2 };
      break;
    case 'center':
    default:
      unrotatedPoint = center;
      break;
  }

  return rotatePoint(unrotatedPoint, center, item.rotation || 0);
}

export function getAllItemAnchors(item: BoardItem): AnchorPoint[] {
  if (item.type === 'connector' || item.type === 'stroke') return [];
  const positions: AnchorPosition[] = ['top', 'right', 'bottom', 'left', 'center'];
  return positions.map((pos) => ({
    itemId: item.id,
    anchor: pos,
    point: getItemAnchorPoint(item, pos),
  }));
}

export function findNearestAnchor(
  point: Point,
  items: BoardItem[],
  excludeItemId?: string,
  threshold = 24
): AnchorPoint | null {
  let closest: AnchorPoint | null = null;
  let minDistance = threshold;

  for (const item of items) {
    if (item.id === excludeItemId || item.type === 'connector' || item.type === 'stroke') {
      continue;
    }
    const anchors = getAllItemAnchors(item);
    for (const anchor of anchors) {
      const d = distance(point, anchor.point);
      if (d < minDistance) {
        minDistance = d;
        closest = anchor;
      }
    }
  }

  return closest;
}

export function getItemBounds(item: BoardItem): Rect {
  if (item.type === 'stroke') {
    if (item.points.length < 2) return { x: item.x, y: item.y, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < item.points.length; i += 2) {
      const px = item.points[i];
      const py = item.points[i + 1];
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10),
    };
  }

  if (item.type === 'connector') {
    const minX = Math.min(item.startPoint.x, item.endPoint.x);
    const minY = Math.min(item.startPoint.y, item.endPoint.y);
    const maxX = Math.max(item.startPoint.x, item.endPoint.x);
    const maxY = Math.max(item.startPoint.y, item.endPoint.y);
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10),
    };
  }

  return {
    x: item.x,
    y: item.y,
    width: Math.abs(item.width),
    height: Math.abs(item.height),
  };
}

export function rectIntersects(r1: Rect, r2: Rect): boolean {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

export function getCombinedBounds(items: BoardItem[]): Rect | null {
  if (items.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const item of items) {
    const b = getItemBounds(item);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getConnectorPoints(
  item: BoardItem & { type: 'connector' },
  itemsById: Map<string, BoardItem>
): { start: Point; end: Point; points: number[] } {
  let start = item.startPoint;
  let end = item.endPoint;

  if (item.fromId && itemsById.has(item.fromId)) {
    const fromItem = itemsById.get(item.fromId)!;
    start = getItemAnchorPoint(fromItem, item.fromAnchor || 'center');
  }

  if (item.toId && itemsById.has(item.toId)) {
    const toItem = itemsById.get(item.toId)!;
    end = getItemAnchorPoint(toItem, item.toAnchor || 'center');
  }

  if (item.style === 'orthogonal') {
    const midX = (start.x + end.x) / 2;
    return {
      start,
      end,
      points: [start.x, start.y, midX, start.y, midX, end.y, end.x, end.y],
    };
  }

  if (item.style === 'curved') {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy);
    const midX = (start.x + end.x) / 2 - (dy / dist) * Math.min(dist * 0.2, 40);
    const midY = (start.y + end.y) / 2 + (dx / dist) * Math.min(dist * 0.2, 40);
    return {
      start,
      end,
      points: [start.x, start.y, midX, midY, end.x, end.y],
    };
  }

  // Straight line
  return {
    start,
    end,
    points: [start.x, start.y, end.x, end.y],
  };
}

