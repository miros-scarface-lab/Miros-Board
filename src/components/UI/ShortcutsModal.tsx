import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'Tools',
      items: [
        { key: 'V', desc: 'Select tool' },
        { key: 'H', desc: 'Hand / Pan tool' },
        { key: 'N', desc: 'Sticky note' },
        { key: 'T', desc: 'Text box' },
        { key: 'S', desc: 'Shapes (Rect, Ellipse, Triangle...)' },
        { key: 'P', desc: 'Pen (Freehand drawing)' },
        { key: 'P', desc: 'Pen (with Smart Shape detection)' },
        { key: 'L', desc: 'Connector / Arrow' },
        { key: 'M', desc: 'Table / Matrix' },
        { key: 'E', desc: 'Eraser' },
      ],
    },
    {
      title: 'Navigation & View',
      items: [
        { key: 'Space + Drag', desc: 'Pan canvas' },
        { key: 'Middle Mouse Drag', desc: 'Pan canvas' },
        { key: 'Ctrl + Scroll', desc: 'Zoom in / out towards cursor' },
        { key: 'Shift + 1', desc: 'Zoom to fit all items' },
        { key: 'Ctrl + 0', desc: 'Reset zoom to 100%' },
        { key: 'Ctrl + / -', desc: 'Zoom in / out' },
      ],
    },
    {
      title: 'Editing & Manipulation',
      items: [
        { key: 'Double Click', desc: 'Edit text in sticky note or shape' },
        { key: 'Shift + Click', desc: 'Multi-select objects' },
        { key: 'Drag Box', desc: 'Marquee selection' },
        { key: 'Ctrl + D', desc: 'Duplicate selected' },
        { key: 'Ctrl + C / V', desc: 'Copy / Paste' },
        { key: 'Ctrl + L', desc: 'Lock / Unlock object' },
        { key: 'Del / Backspace', desc: 'Delete selected object(s)' },
        { key: 'Esc', desc: 'Deselect / Cancel edit' },
      ],
    },
    {
      title: 'History',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Shift + Z', desc: 'Redo' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-neutral-500">Fast keyboard navigation & manipulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="py-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {shortcutSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-xs"
                  >
                    <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                      {item.desc}
                    </span>
                    <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-2xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

