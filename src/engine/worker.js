// worker.js — Web Worker for ASCII engine
// Receives: { imageData, settings, cellW, cellH }
// Posts back: { grid: Array<Array<{char,color,bgColor}>> }

import { preprocess } from './preprocess.js';
import { sobelPass } from './sobel.js';
import { luminanceToChar, CHAR_RAMPS } from './charmap.js';
import { applyColorMode } from './colorize.js';

self.onmessage = function(e) {
  const { pixelData, origPixelData, width, height, settings, cellW, cellH } = e.data;

  const data = new Uint8ClampedArray(pixelData);
  const origData = new Uint8ClampedArray(origPixelData);

  // Step 1: Preprocess
  const processed = preprocess({ data, width, height }, settings);

  // Step 2: Sobel (optional)
  let sobelData = null;
  if (settings.sobelOn) {
    sobelData = sobelPass(processed, width, height, settings.sobelThreshold);
  }

  // Step 3: Apply vignette, mirror, zoom effects to processed data
  const effectData = applyPixelEffects(processed, origData, width, height, settings);

  // Step 4: Build char grid
  const cols = Math.floor(width / cellW);
  const rows = Math.floor(height / cellH);

  const ramp = settings.charsetCustom
    ? settings.customChars
    : (CHAR_RAMPS[settings.charsetPreset] || CHAR_RAMPS.standard);

  const grid = [];
  const noiseChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  const matrixChars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ012345789Z';

  for (let row = 0; row < rows; row++) {
    const gridRow = [];
    for (let col = 0; col < cols; col++) {
      // Aspect ratio correction: monospace chars ~0.55 wide:tall ratio
      // We sample pixels at x, y*0.55 compressed height
      const px = Math.min(Math.floor(col * cellW + cellW / 2), width - 1);
      // aspectRatio correction: sample y position needs to account for char aspect
      const pyRaw = Math.floor(row * cellH + cellH / 2);
      const pyCorrected = Math.min(Math.floor(pyRaw * 0.55), height - 1);

      const pixelIdx = (pyCorrected * width + px) * 4;
      const r = effectData[pixelIdx];
      const g = effectData[pixelIdx + 1];
      const b = effectData[pixelIdx + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      // Original color
      const origIdx = (pyCorrected * width + px) * 4;
      const or = origData[origIdx];
      const og = origData[origIdx + 1];
      const ob = origData[origIdx + 2];

      // Character selection
      let char;

      if (settings.sobelOn && sobelData) {
        const mapIdx = pyCorrected * width + px;
        const mag = sobelData.magnitude[mapIdx];
        if (mag > settings.sobelThreshold) {
          char = getEdgeChar(sobelData.angle[mapIdx]);
        } else {
          char = luminanceToChar(lum, ramp, settings.invertRamp);
        }
      } else if (settings.renderMode === 'threshold') {
        char = lum > 127 ? (ramp[ramp.length - 1] || '#') : ' ';
      } else {
        char = luminanceToChar(lum, ramp, settings.invertRamp);
      }

      // Random noise effect
      if (settings.noise > 0 && Math.random() * 100 < settings.noise) {
        char = noiseChars[Math.floor(Math.random() * noiseChars.length)];
      }

      // Matrix mode random chars overlay
      if (settings.renderMode === 'matrix' && Math.random() < 0.02) {
        char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      }

      // Vignette modifier on luminance for colorize
      const vignetteLum = applyVignetteLum(lum, col, row, cols, rows, settings.vignette);

      // Color
      const cell = { char, r, g, b, or, og, ob, lum: vignetteLum };
      const { color, bgColor } = applyColorMode(cell, settings);

      gridRow.push({ char, color, bgColor });
    }
    grid.push(gridRow);
  }

  self.postMessage({ grid });
};

function getEdgeChar(angle) {
  let deg = (angle * 180 / Math.PI + 180) % 180;
  if (deg < 22.5 || deg >= 157.5) return '-';
  if (deg >= 22.5 && deg < 67.5)  return '/';
  if (deg >= 67.5 && deg < 112.5) return '|';
  return '\\';
}

function applyVignetteLum(lum, col, row, cols, rows, strength) {
  if (!strength) return lum;
  const cx = (col / cols - 0.5) * 2;
  const cy = (row / rows - 0.5) * 2;
  const dist = Math.sqrt(cx * cx + cy * cy);
  const factor = Math.max(0, 1 - dist * strength);
  return Math.round(lum * factor);
}

function applyPixelEffects(data, origData, width, height, settings) {
  let out = new Uint8ClampedArray(data);

  // Mirror effect
  if (settings.mirrorH) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const i1 = (y * width + x) * 4;
        const i2 = (y * width + (width - 1 - x)) * 4;
        for (let c = 0; c < 4; c++) {
          const tmp = out[i1 + c];
          out[i1 + c] = out[i2 + c];
          out[i2 + c] = tmp;
        }
      }
    }
  }

  if (settings.mirrorV) {
    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        const i1 = (y * width + x) * 4;
        const i2 = ((height - 1 - y) * width + x) * 4;
        for (let c = 0; c < 4; c++) {
          const tmp = out[i1 + c];
          out[i1 + c] = out[i2 + c];
          out[i2 + c] = tmp;
        }
      }
    }
  }

  return out;
}
