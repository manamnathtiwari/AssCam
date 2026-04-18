// charmap.js — luminance to character mapping

export const CHAR_RAMPS = {
  ultraDense: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  standard:   " .:-=+*#%@",
  blocks:     " \u2591\u2592\u2593\u2588",
  braille:    " \u2801\u2803\u2807\u280f\u281f\u283f",
  minimal:    " .:",
  binary:     " 01",
};

export const RAMP_LABELS = {
  ultraDense: 'Ultra Dense',
  standard:   'Standard',
  blocks:     'Blocks',
  braille:    'Braille',
  minimal:    'Minimal',
  binary:     'Binary',
};

// Map luminance (0–255) to character in ramp
export function luminanceToChar(lum, ramp, invert) {
  const r = invert ? ramp.split('').reverse().join('') : ramp;
  const idx = Math.floor((lum / 255) * (r.length - 1));
  return r[Math.min(idx, r.length - 1)];
}

// Build the full character grid from processed pixel data
// Returns: Array of rows, each row is array of { char, r, g, b, lum }
export function buildCharGrid(data, origData, width, height, cellW, cellH, settings, sobelData) {
  const { charset, invertRamp, sobelOn, sobelThreshold, renderMode } = settings;
  const ramp = charset;

  const cols = Math.floor(width / cellW);
  const rows = Math.floor(height / cellH);

  const grid = [];

  for (let row = 0; row < rows; row++) {
    const gridRow = [];
    for (let col = 0; col < cols; col++) {
      // Sample center of cell — apply aspect ratio correction
      // Monospace chars are ~0.55× as wide as tall, so compress vertically
      const px = Math.floor(col * cellW + cellW / 2);
      const py = Math.floor(row * cellH * 0.55 + cellH * 0.55 / 2); // aspect correction

      const clampedPx = Math.min(px, width - 1);
      const clampedPy = Math.min(py, height - 1);
      const pixelIdx = (clampedPy * width + clampedPx) * 4;

      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      let char;

      // Sobel edge detection override
      if (sobelOn && sobelData) {
        const mapIdx = clampedPy * width + clampedPx;
        const mag = sobelData.magnitude[mapIdx];
        if (mag > sobelThreshold) {
          char = getEdgeChar(sobelData.angle[mapIdx]);
        } else {
          char = luminanceToChar(lum, ramp, invertRamp);
        }
      } else {
        char = luminanceToChar(lum, ramp, invertRamp);
      }

      // Original pixel RGB for color modes
      const origIdx = (clampedPy * width + clampedPx) * 4;
      const or = origData ? origData[origIdx] : r;
      const og = origData ? origData[origIdx + 1] : g;
      const ob = origData ? origData[origIdx + 2] : b;

      gridRow.push({ char, r, g, b, or, og, ob, lum });
    }
    grid.push(gridRow);
  }

  return grid;
}

function getEdgeChar(angle) {
  let deg = (angle * 180 / Math.PI + 180) % 180;
  if (deg < 22.5 || deg >= 157.5) return '-';
  if (deg >= 22.5 && deg < 67.5)  return '/';
  if (deg >= 67.5 && deg < 112.5) return '|';
  return '\\';
}
