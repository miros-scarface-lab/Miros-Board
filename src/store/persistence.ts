import { BoardItem } from '../types/board';

const STORAGE_KEY = 'miro_whiteboard_data_v1';
const STORAGE_KEY = 'miros_whiteboard_data_v2';

export interface PersistedBoardData {
  version: number;
  boardName: string;
  theme: 'light' | 'dark';
  items: BoardItem[];
  lastSavedAt: string;
}

export const INITIAL_SAMPLE_ITEMS: BoardItem[] = [
  {
    id: 'sample-sticky-1',
    type: 'sticky',
    x: 200,
    y: 160,
    x: 140,
    y: 140,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 1,
    locked: false,
    color: '#FEF08A',
    text: '💡 Welcome to Miro Whiteboard!\n\n• Double click to edit\n• Press N for stickies\n• Press S for shapes\n• Press L for connectors',
    fontSize: 16,
    text: '💡 Welcome to miros!\n\n• Smart Drawing (Pen)\n  Draw a circle/box/line to auto-detect!\n• Matrix & Tables (M)\n• Connectors (L)',
    fontSize: 15,
    fontFamily: 'Inter',
    textAlign: 'left',
    textColor: '#713F12',
  },
  {
    id: 'sample-shape-1',
    type: 'shape',
    shapeType: 'rounded-rectangle',
    x: 480,
    y: 180,
    width: 220,
    x: 400,
    y: 150,
    width: 210,
    height: 140,
    rotation: 0,
    zIndex: 2,
    locked: false,
    fill: '#E0F2FE',
    stroke: '#2563EB',
    strokeWidth: 2,
    strokeStyle: 'solid',
    text: 'Connect me! 🚀\n(Drag connector to snap)',
    text: 'miros Smart Board 🚀\n(Auto-converts sketches into clean shapes)',
    textColor: '#1E293B',
    fontSize: 16,
    fontSize: 15,
  },
  {
    id: 'sample-sticky-2',
    type: 'sticky',
    x: 780,
    y: 160,
    width: 200,
    height: 200,
    rotation: 0,
    zIndex: 3,
    locked: false,
    color: '#BBF7D0',
    text: '🎯 Unlimited Canvas\n\n• Space + Drag to Pan\n• Ctrl + Scroll to Zoom\n• Ctrl + Z / Ctrl + Shift + Z',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'left',
    textColor: '#14532D',
  },
  {
    id: 'sample-connector-1',
    type: 'connector',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 4,
    zIndex: 3,
    locked: false,
    fromId: 'sample-sticky-1',
    fromAnchor: 'right',
    toId: 'sample-shape-1',
    toAnchor: 'left',
    startPoint: { x: 400, y: 260 },
    endPoint: { x: 480, y: 250 },
    startPoint: { x: 340, y: 240 },
    endPoint: { x: 400, y: 220 },
    style: 'curved',
    color: '#2563EB',
    strokeWidth: 3,
    strokeWidth: 2.5,
    arrowStart: false,
    arrowEnd: true,
  },
  {
    id: 'sample-connector-2',
    type: 'connector',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    id: 'sample-table-1',
    type: 'table',
    x: 670,
    y: 120,
    width: 380,
    height: 220,
    rotation: 0,
    zIndex: 5,
    zIndex: 4,
    locked: false,
    fromId: 'sample-shape-1',
    fromAnchor: 'right',
    toId: 'sample-sticky-2',
    toAnchor: 'left',
    startPoint: { x: 700, y: 250 },
    endPoint: { x: 780, y: 260 },
    style: 'curved',
    color: '#16A34A',
    strokeWidth: 3,
    arrowStart: false,
    arrowEnd: true,
    title: 'Project Matrix 📊',
    rows: 3,
    cols: 3,
    cells: [
      ['Feature', 'Status', 'Priority'],
      ['Smart Shapes', 'Complete ✅', 'High'],
      ['Table Matrix', 'Active 🚀', 'Urgent'],
    ],
    headerColor: '#F1F5F9',
    cellColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    textColor: '#1E293B',
    fontSize: 14,
  },
];

export function loadBoardFromStorage(): {
  boardName: string;
  theme: 'light' | 'dark';
  items: BoardItem[];
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        boardName: 'My Miro Board',
        boardName: 'miros',
        theme: 'light',
        items: INITIAL_SAMPLE_ITEMS,
      };
    }
    const parsed = JSON.parse(raw) as PersistedBoardData;
    return {
      boardName: parsed.boardName || 'My Miro Board',
      boardName: parsed.boardName || 'miros',
      theme: parsed.theme || 'light',
      items: Array.isArray(parsed.items) ? parsed.items : INITIAL_SAMPLE_ITEMS,
      items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : INITIAL_SAMPLE_ITEMS,
    };
  } catch (e) {
    console.warn('Failed to load board from localStorage:', e);
    return {
      boardName: 'My Miro Board',
      boardName: 'miros',
      theme: 'light',
      items: INITIAL_SAMPLE_ITEMS,
    };
  }
}

let saveTimeout: number | undefined;

export function saveBoardToStorage(
  items: BoardItem[],
  boardName: string,
  theme: 'light' | 'dark',
  debounceMs = 500
) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = window.setTimeout(() => {
    try {
      const payload: PersistedBoardData = {
        version: 1,
        version: 2,
        boardName,
        theme,
        items,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save board to localStorage:', e);
    }
  }, debounceMs);
}

export function clearBoardStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear board storage:', e);
  }
}

