import { useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { useCanvasStore } from '../store/useCanvasStore';
import { getCombinedBounds } from '../utils/math';

export function useKeyboardShortcuts() {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    paste,
    clearSelection,
    editingId,
    items,
    toggleLock,
  } = useBoardStore();

  const {
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    setIsSpacePressed,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        editingId !== null;

      // Handle space bar for panning
      if (e.code === 'Space' && !isInput && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      // If user is editing text inside an input/textarea, do not intercept tool keys
      if (isInput) {
        if (e.key === 'Escape') {
          useBoardStore.getState().setEditingId(null);
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') ||
        (cmdOrCtrl && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Copy
      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      // Paste
      if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      // Lock / Unlock
      if (cmdOrCtrl && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLock();
        return;
      }

      // Zoom Reset (Ctrl+0)
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // Zoom In (Ctrl + / =)
      if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Zoom Out (Ctrl -)
      if (cmdOrCtrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Fit to Screen (Shift + 1)
      if (e.shiftKey && e.key === '!') {
        e.preventDefault();
        zoomToFit(getCombinedBounds(items));
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        setActiveTool('select');
        return;
      }

      // Tool switching (single letter keys without cmd/ctrl)
      if (!cmdOrCtrl && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 'n':
            setActiveTool('sticky');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 's':
            setActiveTool('shape');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'l':
            setActiveTool('connector');
            break;
          case 'm':
            setActiveTool('table');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    paste,
    clearSelection,
    editingId,
    items,
    toggleLock,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    setIsSpacePressed,
  ]);
}

