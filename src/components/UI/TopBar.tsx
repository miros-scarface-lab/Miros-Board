import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Trash2,
  Sun,
  Moon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { exportBoardAsPNG } from '../../utils/export';

interface Props {
  onOpenShortcuts: () => void;
  stageRef: React.RefObject<any>;
}

export const TopBar: React.FC<Props> = ({ onOpenShortcuts, stageRef }) => {
  const boardName = useBoardStore((s) => s.boardName);
  const setBoardName = useBoardStore((s) => s.setBoardName);
  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const canUndo = useBoardStore((s) => s.canUndo);
  const canRedo = useBoardStore((s) => s.canRedo);
  const clearBoard = useBoardStore((s) => s.clearBoard);
  const theme = useBoardStore((s) => s.theme);
  const toggleTheme = useBoardStore((s) => s.toggleTheme);
  const items = useBoardStore((s) => s.items);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(boardName);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setBoardName(tempName.trim());
    } else {
      setTempName(boardName);
    }
    setIsEditingName(false);
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    exportBoardAsPNG(stageRef.current, items, boardName, {
    exportBoardAsPNG(stageRef.current, items, boardName || 'miros', {
      backgroundColor: theme === 'dark' ? '#18181B' : '#F8FAFC',
    });
  };

  const handleClear = () => {
    if (items.length === 0) return;
    if (window.confirm('Are you sure you want to clear the entire whiteboard? This can be undone with Ctrl+Z.')) {
      clearBoard();
    }
  };

  return (
    <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Brand & Editable Board Name */}
      <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-3 py-2 shadow-lg shadow-black/5 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 text-sm">
          <div className="w-5 h-5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Miro Board</span>
          <span>miros</span>
        </div>

        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700" />

        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setTempName(boardName);
                setIsEditingName(false);
              }
            }}
            autoFocus
            className="text-sm font-medium text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded outline-none border border-blue-500 w-44"
          />
        ) : (
          <button
            onClick={() => {
              setTempName(boardName);
              setIsEditingName(true);
            }}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-0.5 rounded transition-colors"
            title="Click to rename board"
          >
            {boardName}
          </button>
        )}
      </div>

      {/* Center: Undo / Redo */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-2 py-1.5 shadow-lg shadow-black/5 pointer-events-auto">
        <button
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions (Export, Clear, Theme, Shortcuts) */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-1.5 shadow-lg shadow-black/5 pointer-events-auto">
        {/* Export PNG */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          title="Export board as high-resolution PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PNG</span>
        </button>

        {/* Clear Board */}
        <button
          onClick={handleClear}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          title="Clear Board"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Shortcuts / Help modal */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

