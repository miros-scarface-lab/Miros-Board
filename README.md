
# miros Whiteboard Editor

A web-based infinite whiteboard application inspired by the Miro board editor. Built with React, TypeScript, Konva (`react-konva`), Zustand, and Tailwind CSS.
A modern web-based infinite whiteboard application inspired by the Miro board editor. Built with React, TypeScript, Konva (`react-konva`), Zustand, and Tailwind CSS.

---

## ✨ Features

- **Infinite Canvas & Navigation**
  - Smooth pan: Hold `Space` + drag, middle mouse click + drag, trackpad scroll, or Hand tool (`H`).
  - Zoom to cursor: `Ctrl/Cmd + Wheel`, trackpad pinch, or bottom-left zoom controls (`10%` to `400%`).
  - Fit to screen (`Shift + 1`) and reset zoom (`Ctrl + 0`).
  - Dynamic infinite dot-grid that scales density with zoom levels.

- **Miro-Style Left Vertical Toolbar**
  - **Select (`V`)**: Single selection, Shift-click multi-select, and marquee drag-selection.
  - **Hand / Pan (`H`)**: Direct canvas panning.
  - **Sticky Notes (`N`)**: Pastel palette, click to place, double-click inline text editing with auto-wrap.
  - **Text Box (`T`)**: Free text, custom font sizes, colors, and styling (bold, italic).
  - **Shapes (`S`)**: Rectangle, rounded rectangle, ellipse, triangle, and diamond with customizable fill, border stroke, and dashed styles.
  - **Pen (`P`)**: Freehand drawing with smooth bezier curve tension, custom colors, and stroke weights.
  - **Smart Pen (`P`)**: Freehand drawing with **automatic shape recognition**! Draw a rough circle, square, rectangle, triangle, or straight line and miros automatically snaps it into a clean vector shape. Toggleable in the pen settings.
  - **Table / Matrix (`M`)**: Full grid matrix / table component. Presets for 2×2, 3×3, 4×3. Double-click any cell to edit. Easily add or delete rows and columns from the contextual toolbar.
  - **Connector / Arrow (`L`)**: Dynamic magnetic snap to object anchor points (top, bottom, left, right, center); stays attached and follows shapes in real time as they move.
  - **Eraser (`E`)**: Click or tap to instantly remove objects.

- **Object Manipulation**
  - Move, scale, and rotate using Miro-inspired cyan transformer handles.
  - Multi-item dragging and group transformations.
  - Duplicate (`Ctrl + D`), Copy (`Ctrl + C`), Paste (`Ctrl + V`), and Delete (`Del` / `Backspace`).
  - Layer ordering: Bring to Front and Send to Back.
  - Lock / Unlock (`Ctrl + L`) to protect objects from accidental changes.
  - Floating contextual property toolbar dynamically positioned above active selection.
  - Floating contextual property toolbar dynamically positioned above active selection (with table row/col controls).

- **State & Persistence**
  - Full Undo / Redo (`Ctrl + Z` / `Ctrl + Shift + Z` or `Ctrl + Y`).
  - Throttled `localStorage` autosave persists your board automatically across page reloads.

- **Controls & Export**
  - **Top Bar**: Editable board name, undo/redo triggers, high-DPI PNG export, clear board, and light/dark theme toggle.
  - **Top Bar**: Editable board name (`miros`), undo/redo triggers, high-DPI PNG export, clear board, and light/dark theme toggle.
  - **Bottom-Left**: Zoom percentage readout with quick preset menu (50%, 75%, 100%, 150%, 200%, 300%), zoom in/out, fit all.
  - **Bottom-Right Interactive Minimap**: Live bird's-eye view of all board elements with viewport rectangle; click or drag inside the minimap to pan stage camera immediately.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 24)
- npm or pnpm

### Installation
```bash
# Clone or navigate to the project directory
cd WhiteBoard

# Install dependencies
npm install

# Run Vite dev server
npm run dev
### Quick Start (PowerShell / Command Prompt)
```powershell
npm.cmd run dev
```
*(Or in Command Prompt: `npm run dev`)*

Open your browser and navigate to `http://localhost:5173`.

### Production Build
```bash
# Build the production bundle
npm run build

# Preview the production build
npm run preview
```powershell
npm.cmd run build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **Tools** | |
| `V` | Select tool |
| `H` | Hand / Pan tool |
| `N` | Sticky Note tool |
| `T` | Free Text tool |
| `S` | Shape tool (cycle rectangle, rounded rect, ellipse, triangle, diamond) |
| `P` | Freehand Pen tool |
| `S` | Shape tool (rectangle, rounded rect, ellipse, triangle, diamond) |
| `P` | Smart Pen (auto-detects circle, square, triangle, straight line) |
| `L` | Connector / Arrow tool |
| `M` | Table / Matrix tool |
| `E` | Eraser tool |
| **Navigation** | |
| `Space + Drag` | Pan canvas |
| `Middle Click + Drag` | Pan canvas |
| `Ctrl + Scroll` | Zoom into / out from cursor |
| `Ctrl + =` / `Ctrl + +` | Zoom In |
| `Ctrl + -` | Zoom Out |
| `Ctrl + 0` | Reset Zoom to 100% |
| `Shift + 1` | Zoom to fit all board objects |
| **Manipulation** | |
| `Double Click` | Edit text inside sticky note, text box, or shape |
| `Double Click` | Edit text in note, shape, or table cell |
| `Shift + Click` | Multi-select objects |
| `Click + Drag (empty)` | Marquee box multi-selection |
| `Ctrl + D` | Duplicate selected object(s) |
| `Ctrl + C` | Copy selected |
| `Ctrl + V` | Paste |
| `Ctrl + L` | Lock / Unlock selected object(s) |
| `Delete` / `Backspace` | Delete selected object(s) |
| `Esc` | Deselect all / Cancel active tool |
| **History** | |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` / `Ctrl + Y` | Redo |
