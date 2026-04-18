// sobel.js — Sobel edge detection, runs inside Web Worker

export function sobelPass(data, width, height, threshold) {
  // Convert to grayscale first
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  const magnitude = new Float32Array(width * height);
  const angle = new Float32Array(width * height); // radians

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Sobel kernels
      const tl = gray[(y-1)*width+(x-1)], tm = gray[(y-1)*width+x], tr = gray[(y-1)*width+(x+1)];
      const ml = gray[y*width+(x-1)],                                mr = gray[y*width+(x+1)];
      const bl = gray[(y+1)*width+(x-1)], bm = gray[(y+1)*width+x], br = gray[(y+1)*width+(x+1)];

      const gx = -tl - 2*ml - bl + tr + 2*mr + br;
      const gy = -tl - 2*tm - tr + bl + 2*bm + br;

      const idx = y * width + x;
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      angle[idx] = Math.atan2(gy, gx); // -PI to PI
    }
  }

  return { magnitude, angle };
}

// Map gradient angle to a directional ASCII character
export function angleToChar(angle) {
  // Normalize angle to 0–180 degrees
  let deg = (angle * 180 / Math.PI + 180) % 180;

  if (deg < 22.5 || deg >= 157.5) return '-';       // horizontal
  if (deg >= 22.5 && deg < 67.5)  return '/';       // diagonal up-right
  if (deg >= 67.5 && deg < 112.5) return '|';       // vertical
  if (deg >= 112.5 && deg < 157.5) return '\\';     // diagonal down-right
  return '+';
}
