import { Point } from '../types/canvas';

export type DetectedShape =
  | { type: 'line'; start: Point; end: Point }
  | { type: 'ellipse'; x: number; y: number; width: number; height: number }
  | { type: 'rectangle'; x: number; y: number; width: number; height: number; isSquare: boolean }
  | { type: 'triangle'; x: number; y: number; width: number; height: number }
  | null;

// Distance between two points
function dist(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Perpendicular distance from p to line segment (p1 -> p2)
function distToSegment(p: Point, p1: Point, p2: Point): number {
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
  if (l2 === 0) return dist(p, p1);
  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(p, {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  });
}

// Douglas-Peucker algorithm to simplify polyline
function simplifyPath(points: Point[], tolerance = 15): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, index + 1), tolerance);
    const right = simplifyPath(points.slice(index), tolerance);
    return [...left.slice(0, left.length - 1), ...right];
  }

  return [start, end];
}

// Shoelace formula to compute polygon area
function computePolygonArea(pts: Point[]): number {
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

export function detectShapeFromStroke(rawPoints: number[]): DetectedShape {
  if (!rawPoints || rawPoints.length < 10) return null;

  const pts: Point[] = [];
  for (let i = 0; i < rawPoints.length; i += 2) {
    pts.push({ x: rawPoints[i], y: rawPoints[i + 1] });
  }

  if (pts.length < 5) return null;

  const startPt = pts[0];
  const endPt = pts[pts.length - 1];
  const directDist = dist(startPt, endPt);

  let totalLength = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    totalLength += dist(pts[i], pts[i + 1]);
  }

  if (totalLength < 30) return null;

  // 1. Straight Line Check
  if (directDist > 35 && totalLength / directDist < 1.25) {
    let maxDev = 0;
    for (const p of pts) {
      const d = distToSegment(p, startPt, endPt);
      if (d > maxDev) maxDev = d;
    }
    if (maxDev < 20) {
      return {
        type: 'line',
        start: startPt,
        end: endPt,
      };
    }
  }

  // 2. Closed Shape Check
  const isClosed = directDist < 0.3 * totalLength || directDist < 60;
  if (!isClosed) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 25 || height < 25) return null;

  const boxArea = width * height;
  const polyArea = computePolygonArea(pts);
  const areaRatio = polyArea / boxArea;

  // Polyline simplification to find corners
  const simplified = simplifyPath(pts, 16);
  // Remove duplicate end point if closed
  const uniqueCorners =
    dist(simplified[0], simplified[simplified.length - 1]) < 25
      ? simplified.slice(0, simplified.length - 1)
      : simplified;
  const cornerCount = uniqueCorners.length;

  // 3. Triangle Check: ~3 corners and area ratio 0.35 - 0.65
  if ((cornerCount === 3 || cornerCount === 4) && areaRatio >= 0.32 && areaRatio <= 0.68) {
    return {
      type: 'triangle',
      x: minX,
      y: minY,
      width,
      height,
    };
  }

  // 4. Rectangle / Square Check: areaRatio >= 0.78, corners ~4-6
  if (areaRatio >= 0.78 && cornerCount <= 6) {
    const isSquare = Math.abs(width - height) / Math.max(width, height) < 0.22;
    return {
      type: 'rectangle',
      x: minX,
      y: minY,
      width,
      height,
      isSquare,
    };
  }

  // 5. Circle / Ellipse Check
  // In an ellipse, theoretical areaRatio is pi/4 = 0.785
  // Also radius variation should be small
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const rx = width / 2;
  const ry = height / 2;

  let ellipErrorSum = 0;
  for (const p of pts) {
    const normDist = Math.hypot((p.x - centerX) / rx, (p.y - centerY) / ry);
    ellipErrorSum += Math.abs(normDist - 1.0);
  }
  const avgEllipError = ellipErrorSum / pts.length;

  if (avgEllipError < 0.18 && areaRatio >= 0.60 && areaRatio <= 0.88) {
    return {
      type: 'ellipse',
      x: minX,
      y: minY,
      width,
      height,
    };
  }

  return null;
}