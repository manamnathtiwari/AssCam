// useASCIIEngine.js — RAF loop, worker communication, frame output
import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';

export function useASCIIEngine(videoRef, ready) {
  const store = useStore();
  const workerRef = useRef(null);
  const workerBusy = useRef(false);
  const rafRef = useRef(null);
  const canvasRef = useRef(null);
  const [charGrid, setCharGrid] = useState([]);
  const frozenRef = useRef(false);

  const settings = {
    renderMode: store.renderMode,
    charsetPreset: store.charsetPreset,
    charsetCustom: store.charsetCustom,
    customChars: store.customChars,
    invertRamp: store.invertRamp,
    brightness: store.brightness,
    contrast: store.contrast,
    gamma: store.gamma,
    sharpen: store.sharpen,
    denoise: store.denoise,
    histEq: store.histEq,
    sobelOn: store.sobelOn,
    sobelThreshold: store.sobelThreshold,
    saturation: store.saturation,
    hueRotate: store.hueRotate,
    sepia: store.sepia,
    duoShadow: store.duoShadow,
    duoHighlight: store.duoHighlight,
    heatmapPreset: store.heatmapPreset,
    neonHue: store.neonHue,
    vignette: store.vignette,
    noise: store.noise,
    mirrorH: store.mirrorH,
    mirrorV: store.mirrorV,
    textColor: store.textColor,
    bgColor: store.bgColor,
    bold: store.bold,
    fontSize: store.fontSize,
    lineHeight: store.lineHeight,
    fontFamily: store.fontFamily,
    glitchIntensity: store.glitchIntensity,
  };

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Compute grid dimensions from fontSize and canvas resolution
  const [resW, resH] = (store.resolution || '640x480').split('x').map(Number);
  const cellW = Math.max(2, store.fontSize * 0.55);
  const cellH = Math.max(2, store.fontSize);

  const frameCap = store.frameCap || 30;
  const frameInterval = 1000 / frameCap;
  const lastFrameTime = useRef(0);

  // Init offscreen canvas
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = resW;
    canvas.height = resH;
    canvasRef.current = canvas;
  }, [resW, resH]);

  // Init worker
  useEffect(() => {
    const worker = new Worker(new URL('../engine/worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      workerBusy.current = false;
      if (!frozenRef.current) {
        setCharGrid(e.data.grid);
      }
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // RAF loop
  useEffect(() => {
    if (!ready) return;

    const tick = (timestamp) => {
      rafRef.current = requestAnimationFrame(tick);

      if (timestamp - lastFrameTime.current < frameInterval) return;
      lastFrameTime.current = timestamp;

      if (workerBusy.current || frozenRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Apply zoom (crop center)
      const zoom = settingsRef.current.zoom || 1;
      const cropW = canvas.width / zoom;
      const cropH = canvas.height / zoom;
      const cropX = (canvas.width - cropW) / 2;
      const cropY = (canvas.height - cropH) / 2;

      ctx.save();
      if (settingsRef.current.mirrorH) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      workerBusy.current = true;
      workerRef.current.postMessage({
        pixelData: imageData.data.buffer,
        origPixelData: imageData.data.buffer.slice(0),
        width: canvas.width,
        height: canvas.height,
        settings: settingsRef.current,
        cellW,
        cellH,
      }, [imageData.data.buffer]);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, cellW, cellH, frameInterval]);

  // Snap: freeze current frame, render to high-res canvas, return grid + thumbnail
  const snap = useCallback(async () => {
    frozenRef.current = true;
    const grid = charGrid;

    // Generate thumbnail canvas
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 240;
    thumbCanvas.height = 160;
    const tCtx = thumbCanvas.getContext('2d');

    const s = settingsRef.current;
    tCtx.fillStyle = s.bgColor || '#0a0a0a';
    tCtx.fillRect(0, 0, 240, 160);

    const thumbCols = grid[0]?.length || 1;
    const thumbRows = grid.length || 1;
    const tw = 240 / thumbCols;
    const th = 160 / thumbRows;

    tCtx.font = `${Math.max(2, Math.min(tw, th))}px "${s.fontFamily || 'Courier New'}", monospace`;
    tCtx.textBaseline = 'top';

    for (let row = 0; row < thumbRows; row++) {
      for (let col = 0; col < thumbCols; col++) {
        const cell = grid[row]?.[col];
        if (!cell || cell.char === ' ') continue;
        tCtx.fillStyle = cell.color || '#33ff33';
        tCtx.fillText(cell.char, col * tw, row * th);
      }
    }

    const thumbnail = thumbCanvas.toDataURL('image/png');
    const id = `snap_${Date.now()}`;

    setTimeout(() => { frozenRef.current = false; }, 200);

    return { id, grid, thumbnail, settings: { ...s }, timestamp: Date.now() };
  }, [charGrid]);

  return { charGrid, snap };
}
