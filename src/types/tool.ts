import { ShapeType, ConnectorStyle } from './board';

export type ToolType =
  | 'select'
  | 'hand'
  | 'sticky'
  | 'text'
  | 'shape'
  | 'pen'
  | 'connector'
  | 'table'
  | 'eraser';

export interface ToolSettings {
  stickyColor: string;
  shapeType: ShapeType;
  shapeFill: string;
  shapeStroke: string;
  shapeStrokeWidth: number;
  penColor: string;
  penWidth: number;
  smartDrawing: boolean; // Auto-detect lines, rectangles, circles
  textColor: string;
  textSize: number;
  connectorStyle: ConnectorStyle;
  connectorColor: string;
  connectorWidth: number;
  connectorArrowEnd: boolean;
  tableRows: number;
  tableCols: number;
  tableHeaderColor: string;
}

