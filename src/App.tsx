import React, { useRef, useState, useEffect } from 'react';
import { WhiteboardCanvas } from './components/Canvas/WhiteboardCanvas';
import { Toolbar } from './components/UI/Toolbar';
import { ContextualToolbar } from './components/UI/ContextualToolbar';
import { TopBar } from './components/UI/TopBar';
import { ZoomControls } from './components/UI/ZoomControls';
import { Minimap } from './components/UI/Minimap';
import { ShortcutsModal } from './components/UI/ShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useBoardStore } from './store/useBoardStore';

export function App() {
  const stageRef = useRef<any>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const theme = useBoardStore((s) => s.theme);

  // Bind global hotkeys
  useKeyboardShortcuts();

  // Synchronize dark mode class to <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-neutral-900' : 'bg-neutral-50'}`}>
      {/* Top Header */}
      <TopBar
        onOpenShortcuts={() => setShortcutsOpen(true)}
        stageRef={stageRef}
      />

      {/* Miro Left Toolbar */}
      <Toolbar />

      {/* Canvas Workspace */}
      <WhiteboardCanvas stageRef={stageRef} />

      {/* Floating Contextual Toolbar above selection */}
      <ContextualToolbar />

      {/* Bottom Left Zoom Controls */}
      <ZoomControls />

      {/* Bottom Right Minimap */}
      <Minimap />

      {/* Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
