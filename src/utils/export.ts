import Konva from 'konva';
import { BoardItem } from '../types/board';
import { getCombinedBounds } from './math';

export function exportBoardAsPNG(
  stage: Konva.Stage,
  items: BoardItem[],
  boardName: string,
  options?: {
    pixelRatio?: number;
    padding?: number;
    backgroundColor?: string;
  }
) {
  if (items.length === 0) {
    alert('The board is empty. Add some notes or shapes before exporting!');
    return;
  }

  const bounds = getCombinedBounds(items);
  if (!bounds) return;

  const padding = options?.padding ?? 48;
  const pixelRatio = options?.pixelRatio ?? 2;
  const backgroundColor = options?.backgroundColor ?? '#FFFFFF';

  const exportX = bounds.x - padding;
  const exportY = bounds.y - padding;
  const exportWidth = bounds.width + padding * 2;
  const exportHeight = bounds.height + padding * 2;

  const currentScale = stage.scaleX();
  const currentPos = stage.position();

  try {
    // Hide transformer handles during export
    const transformerLayer = stage.findOne('.transformer-layer');
    if (transformerLayer) transformerLayer.hide();

    // Generate data URL from stage cropped to items bounding box
    const dataURL = stage.toDataURL({
      x: exportX * currentScale + currentPos.x,
      y: exportY * currentScale + currentPos.y,
      width: exportWidth * currentScale,
      height: exportHeight * currentScale,
      pixelRatio: pixelRatio / currentScale,
    });

    if (transformerLayer) transformerLayer.show();

    // Composite with background color on offscreen canvas so it's not transparent
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stage content
      ctx.drawImage(img, 0, 0);

      // Download composite
      const finalDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = boardName.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'whiteboard';
      link.download = `${safeName}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = finalDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = dataURL;
  } catch (err) {
    console.error('Failed to export board:', err);
    alert('Export failed. Please ensure the canvas has finished rendering.');
  }
}
