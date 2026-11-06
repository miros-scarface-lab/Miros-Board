export type ItemType = 'sticky' | 'shape' | 'text' | 'stroke' | 'connector';
export type ItemType = 'sticky' | 'shape' | 'text' | 'stroke' | 'connector' | 'table';

export type ShapeType = 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'triangle' | 'diamond';

export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type ConnectorStyle = 'straight' | 'curved' | 'orthogonal';

export interface BaseItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
}

export interface StickyNoteItem extends BaseItem {
  type: 'sticky';
  color: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  textColor?: string;
}

export interface ShapeItem extends BaseItem {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed';
  text?: string;
  textColor?: string;
  fontSize?: number;
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
  textAlign: 'left' | 'center' | 'right';
}

export interface StrokeItem extends BaseItem {
  type: 'stroke';
  points: number[];
  color: string;
  strokeWidth: number;
  tension: number;
}

export interface ConnectorItem extends BaseItem {
  type: 'connector';
  fromId?: string;
  fromAnchor?: AnchorPosition;
  toId?: string;
  toAnchor?: AnchorPosition;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  style: ConnectorStyle;
  color: string;
  strokeWidth: number;
  arrowStart: boolean;
  arrowEnd: boolean;
}

export interface TableItem extends BaseItem {
  type: 'table';
  title?: string;
  rows: number;
  cols: number;
  cells: string[][]; // rows x cols text strings
  headerColor: string;
  cellColor: string;
  borderColor: string;
  textColor: string;
  fontSize: number;
}

export type BoardItem =
  | StickyNoteItem
  | ShapeItem
  | TextItem
  | StrokeItem
  | ConnectorItem;

  | ConnectorItem
  | TableItem;
