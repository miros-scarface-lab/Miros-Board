import { create } from 'zustand';
import { BoardItem, ItemType } from '../types/board';
import { BoardItem, TableItem } from '../types/board';
import { ToolType, ToolSettings } from '../types/tool';
import {
  loadBoardFromStorage,
  saveBoardToStorage,
  clearBoardStorage,
} from './persistence';

interface EditingCell {
  itemId: string;
  row: number;
  col: number;
}

interface BoardState {
  items: BoardItem[];
  selectedIds: string[];
  editingId: string | null;
  editingCell: EditingCell | null;
  activeTool: ToolType;
  toolSettings: ToolSettings;
  boardName: string;
  theme: 'light' | 'dark';
  clipboard: BoardItem[];
  
  // History
  past: BoardItem[][];
  future: BoardItem[][];

  // Actions
  setActiveTool: (tool: ToolType) => void;
  updateToolSettings: (settings: Partial<ToolSettings>) => void;
  setEditingId: (id: string | null) => void;
  setEditingCell: (cell: EditingCell | null) => void;
  setBoardName: (name: string) => void;
  toggleTheme: () => void;
  
  // Selection
  setSelectedIds: (ids: string[]) => void;
  toggleSelect: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  
  // Items
  addItem: (item: BoardItem, selectAfter?: boolean) => void;
  updateItem: (id: string, partial: Partial<BoardItem>, recordHist?: boolean) => void;
  updateItems: (updates: { id: string; partial: Partial<BoardItem> }[], recordHist?: boolean) => void;
  deleteSelected: () => void;
  deleteItem: (id: string) => void;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  toggleLock: (id?: string) => void;
  clearBoard: () => void;
  
  // Table / Matrix specific actions
  updateTableCell: (itemId: string, row: number, col: number, text: string) => void;
  addTableRow: (itemId: string) => void;
  deleteTableRow: (itemId: string) => void;
  addTableCol: (itemId: string) => void;
  deleteTableCol: (itemId: string) => void;

  // Clipboard
  copySelected: () => void;
  paste: () => void;
  
  // History
  recordHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const initialSaved = loadBoardFromStorage();

const initialToolSettings: ToolSettings = {
  stickyColor: '#FEF08A',
  shapeType: 'rounded-rectangle',
  shapeFill: '#E0F2FE',
  shapeStroke: '#2563EB',
  shapeStrokeWidth: 2,
  penColor: '#1E293B',
  penWidth: 4,
  smartDrawing: true, // Default ON for auto-recognizing shapes
  textColor: '#1E293B',
  textSize: 24,
  connectorStyle: 'curved',
  connectorColor: '#2563EB',
  connectorWidth: 2,
  connectorArrowEnd: true,
  tableRows: 3,
  tableCols: 3,
  tableHeaderColor: '#F1F5F9',
};

export const useBoardStore = create<BoardState>((set, get) => ({
  items: initialSaved.items,
  selectedIds: [],
  editingId: null,
  editingCell: null,
  activeTool: 'select',
  toolSettings: initialToolSettings,
  boardName: initialSaved.boardName,
  boardName: initialSaved.boardName || 'miros',
  theme: initialSaved.theme,
  clipboard: [],
  past: [],
  future: [],

  setActiveTool: (tool) => {
    set({ activeTool: tool });
    if (tool !== 'select') {
      set({ selectedIds: [], editingId: null });
      set({ selectedIds: [], editingId: null, editingCell: null });
    }
  },

  updateToolSettings: (settings) => {
    set((state) => ({
      toolSettings: { ...state.toolSettings, ...settings },
    }));
  },

  setEditingId: (id) => set({ editingId: id }),
  setEditingId: (id) => set({ editingId: id, editingCell: null }),
  setEditingCell: (cell) => set({ editingCell: cell, editingId: null }),

  setBoardName: (name) => {
    set({ boardName: name });
    const { items, theme } = get();
    saveBoardToStorage(items, name, theme);
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      saveBoardToStorage(state.items, state.boardName, next);
      return { theme: next };
    });
  },

  setSelectedIds: (ids) => {
    set({ selectedIds: ids });
  },

  toggleSelect: (id, multiSelect = false) => {
    set((state) => {
      if (!multiSelect) {
        return { selectedIds: [id] };
      }
      if (state.selectedIds.includes(id)) {
        return { selectedIds: state.selectedIds.filter((item) => item !== id) };
      }
      return { selectedIds: [...state.selectedIds, id] };
    });
  },

  clearSelection: () => {
    set({ selectedIds: [], editingId: null });
    set({ selectedIds: [], editingId: null, editingCell: null });
  },

  recordHistory: () => {
    const { items, past } = get();
    // Deep clone items array for snapshot
    const snapshot = JSON.parse(JSON.stringify(items));
    set({
      past: [...past.slice(-50), snapshot], // keep up to 50 snapshots
      past: [...past.slice(-50), snapshot],
      future: [],
    });
  },

  addItem: (item, selectAfter = true) => {
    get().recordHistory();
    set((state) => {
      const newItems = [...state.items, item];
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return {
        items: newItems,
        selectedIds: selectAfter ? [item.id] : state.selectedIds,
      };
    });
  },

  updateItem: (id, partial, recordHist = true) => {
    if (recordHist) {
      get().recordHistory();
    }
    set((state) => {
      const newItems = state.items.map((it) =>
        it.id === id ? ({ ...it, ...partial } as BoardItem) : it
      );
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  updateItems: (updates, recordHist = true) => {
    if (recordHist) {
      get().recordHistory();
    }
    const updateMap = new Map(updates.map((u) => [u.id, u.partial]));
    set((state) => {
      const newItems = state.items.map((it) => {
        if (updateMap.has(it.id)) {
          return { ...it, ...updateMap.get(it.id) } as BoardItem;
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  deleteSelected: () => {
    const { selectedIds, items } = get();
    if (selectedIds.length === 0) return;

    // Filter out locked items
    const lockedIds = new Set(
      items.filter((it) => selectedIds.includes(it.id) && it.locked).map((it) => it.id)
    );
    const toDeleteIds = new Set(selectedIds.filter((id) => !lockedIds.has(id)));
    if (toDeleteIds.size === 0) return;

    get().recordHistory();

    set((state) => {
      // Also remove connectors attached to deleted items
      const newItems = state.items.filter((it) => {
        if (toDeleteIds.has(it.id)) return false;
        if (it.type === 'connector') {
          if (it.fromId && toDeleteIds.has(it.fromId)) return false;
          if (it.toId && toDeleteIds.has(it.toId)) return false;
        }
        return true;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return {
        items: newItems,
        selectedIds: state.selectedIds.filter((id) => !toDeleteIds.has(id)),
        editingId: state.editingId && toDeleteIds.has(state.editingId) ? null : state.editingId,
        editingCell: state.editingCell && toDeleteIds.has(state.editingCell.itemId) ? null : state.editingCell,
      };
    });
  },

  deleteItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item || item.locked) return;

    get().recordHistory();

    set((state) => {
      const newItems = state.items.filter((it) => {
        if (it.id === id) return false;
        if (it.type === 'connector') {
          if (it.fromId === id || it.toId === id) return false;
        }
        return true;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return {
        items: newItems,
        selectedIds: state.selectedIds.filter((selId) => selId !== id),
        editingId: state.editingId === id ? null : state.editingId,
        editingCell: state.editingCell?.itemId === id ? null : state.editingCell,
      };
    });
  },

  duplicateSelected: () => {
    const { selectedIds, items } = get();
    if (selectedIds.length === 0) return;

    const selectedItems = items.filter(
      (it) => selectedIds.includes(it.id) && it.type !== 'connector'
    );
    if (selectedItems.length === 0) return;

    get().recordHistory();

    const maxZ = Math.max(0, ...items.map((i) => i.zIndex));
    const newItems: BoardItem[] = selectedItems.map((item, idx) => ({
      ...JSON.parse(JSON.stringify(item)),
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: item.x + 30,
      y: item.y + 30,
      zIndex: maxZ + idx + 1,
      locked: false,
    }));

    set((state) => {
      const merged = [...state.items, ...newItems];
      saveBoardToStorage(merged, state.boardName, state.theme);
      return {
        items: merged,
        selectedIds: newItems.map((it) => it.id),
      };
    });
  },

  bringToFront: () => {
    const { selectedIds, items } = get();
    if (selectedIds.length === 0) return;

    get().recordHistory();
    const maxZ = Math.max(0, ...items.map((i) => i.zIndex));
    
    set((state) => {
      let offset = 1;
      const newItems = state.items.map((it) => {
        if (selectedIds.includes(it.id)) {
          return { ...it, zIndex: maxZ + offset++ };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  sendToBack: () => {
    const { selectedIds, items } = get();
    if (selectedIds.length === 0) return;

    get().recordHistory();
    const minZ = Math.min(...items.map((i) => i.zIndex));

    set((state) => {
      let offset = selectedIds.length;
      const newItems = state.items.map((it) => {
        if (selectedIds.includes(it.id)) {
          return { ...it, zIndex: minZ - offset-- };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  toggleLock: (id) => {
    const targetIds = id ? [id] : get().selectedIds;
    if (targetIds.length === 0) return;

    get().recordHistory();

    set((state) => {
      const newItems = state.items.map((it) => {
        if (targetIds.includes(it.id)) {
          return { ...it, locked: !it.locked };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  clearBoard: () => {
    get().recordHistory();
    set((state) => {
      saveBoardToStorage([], state.boardName, state.theme);
      return {
        items: [],
        selectedIds: [],
        editingId: null,
        editingCell: null,
      };
    });
  },

  // Table Matrix specific implementations
  updateTableCell: (itemId, row, col, text) => {
    get().recordHistory();
    set((state) => {
      const newItems = state.items.map((it) => {
        if (it.id === itemId && it.type === 'table') {
          const table = it as TableItem;
          const newCells = table.cells.map((r, rIdx) =>
            rIdx === row ? r.map((c, cIdx) => (cIdx === col ? text : c)) : [...r]
          );
          return { ...table, cells: newCells };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  addTableRow: (itemId) => {
    get().recordHistory();
    set((state) => {
      const newItems = state.items.map((it) => {
        if (it.id === itemId && it.type === 'table') {
          const table = it as TableItem;
          const newRow = new Array(table.cols).fill('');
          const newRowsCount = table.rows + 1;
          const newHeight = table.height + 40;
          return {
            ...table,
            rows: newRowsCount,
            height: newHeight,
            cells: [...table.cells, newRow],
          };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  deleteTableRow: (itemId) => {
    const table = get().items.find((it) => it.id === itemId && it.type === 'table') as TableItem | undefined;
    if (!table || table.rows <= 1) return;

    get().recordHistory();
    set((state) => {
      const newItems = state.items.map((it) => {
        if (it.id === itemId && it.type === 'table') {
          const t = it as TableItem;
          const newCells = t.cells.slice(0, t.rows - 1);
          return {
            ...t,
            rows: t.rows - 1,
            height: Math.max(80, t.height - 40),
            cells: newCells,
          };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  addTableCol: (itemId) => {
    get().recordHistory();
    set((state) => {
      const newItems = state.items.map((it) => {
        if (it.id === itemId && it.type === 'table') {
          const table = it as TableItem;
          const newCells = table.cells.map((row) => [...row, '']);
          return {
            ...table,
            cols: table.cols + 1,
            width: table.width + 100,
            cells: newCells,
          };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  deleteTableCol: (itemId) => {
    const table = get().items.find((it) => it.id === itemId && it.type === 'table') as TableItem | undefined;
    if (!table || table.cols <= 1) return;

    get().recordHistory();
    set((state) => {
      const newItems = state.items.map((it) => {
        if (it.id === itemId && it.type === 'table') {
          const t = it as TableItem;
          const newCells = t.cells.map((row) => row.slice(0, t.cols - 1));
          return {
            ...t,
            cols: t.cols - 1,
            width: Math.max(120, t.width - 100),
            cells: newCells,
          };
        }
        return it;
      });
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return { items: newItems };
    });
  },

  copySelected: () => {
    const { selectedIds, items } = get();
    const toCopy = items.filter(
      (it) => selectedIds.includes(it.id) && it.type !== 'connector'
    );
    if (toCopy.length > 0) {
      set({ clipboard: JSON.parse(JSON.stringify(toCopy)) });
    }
  },

  paste: () => {
    const { clipboard, items } = get();
    if (clipboard.length === 0) return;

    get().recordHistory();
    const maxZ = Math.max(0, ...items.map((i) => i.zIndex));

    const pasted: BoardItem[] = clipboard.map((item, idx) => ({
      ...JSON.parse(JSON.stringify(item)),
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: item.x + 40,
      y: item.y + 40,
      zIndex: maxZ + idx + 1,
      locked: false,
    }));

    set((state) => {
      const newItems = [...state.items, ...pasted];
      saveBoardToStorage(newItems, state.boardName, state.theme);
      return {
        items: newItems,
        selectedIds: pasted.map((p) => p.id),
      };
    });
  },

  undo: () => {
    const { past, items, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [JSON.parse(JSON.stringify(items)), ...future];

    set((state) => {
      saveBoardToStorage(previous, state.boardName, state.theme);
      return {
        items: previous,
        past: newPast,
        future: newFuture,
        selectedIds: [],
        editingId: null,
        editingCell: null,
      };
    });
  },

  redo: () => {
    const { past, items, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, JSON.parse(JSON.stringify(items))];

    set((state) => {
      saveBoardToStorage(next, state.boardName, state.theme);
      return {
        items: next,
        past: newPast,
        future: newFuture,
        selectedIds: [],
        editingId: null,
        editingCell: null,
      };
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));

