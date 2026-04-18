// preprocess.js — runs inside Web Worker
// Applies: brightness, contrast, gamma, histogram equalization, sharpen, denoise

export function preprocess(imageData, settings) {
  const { brightness, contrast, gamma, histEq, sharpen, denoise } = settings;
  let data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // --- Denoise: box blur passes ---
  for (let pass = 0; pass < (denoise | 0); pass++) {
    data = boxBlur(data, width, height);
  }

  // --- Brightness + Contrast + Gamma ---
  const contrastFactor = contrast;
  const gammaCorrected = gamma !== 1.0;
  const gammaLUT = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let v = i / 255;
    // Gamma
    if (gammaCorrected) v = Math.pow(v, 1.0 / gamma);
    // Contrast (scale from midpoint)
    v = (v - 0.5) * contrastFactor + 0.5;
    // Brightness
    v = v + brightness / 255;
    gammaLUT[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = gammaLUT[data[i]];
    data[i + 1] = gammaLUT[data[i + 1]];
    data[i + 2] = gammaLUT[data[i + 2]];
  }

  // --- Histogram Equalization (on grayscale channel) ---
  if (histEq) {
    data = histogramEqualize(data, width, height);
  }

  // --- Sharpen: 3x3 unsharp mask ---
  if (sharpen > 0) {
    data = unsharpMask(data, width, height, sharpen);
  }

  return data;
}

function boxBlur(data, width, height) {
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
            count++;
          }
        }
      }
      const i = (y * width + x) * 4;
      out[i] = r / count; out[i + 1] = g / count; out[i + 2] = b / count;
      out[i + 3] = data[i + 3];
    }
  }
  return out;
}

function histogramEqualize(data, width, height) {
  const n = width * height;
  const hist = new Int32Array(256);
  // Compute luminance histogram
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
    hist[lum]++;
  }
  // Cumulative distribution
  const cdf = new Int32Array(256);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
  const cdfMin = cdf.find(v => v > 0);
  // Build LUT
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(((cdf[i] - cdfMin) / (n - cdfMin)) * 255);
  }
  // Apply: preserve color, equalize each channel proportionally
  const out = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
    const newLum = lut[lum];
    const scale = lum > 0 ? newLum / lum : 1;
    out[i]     = Math.min(255, data[i] * scale);
    out[i + 1] = Math.min(255, data[i+1] * scale);
    out[i + 2] = Math.min(255, data[i+2] * scale);
  }
  return out;
}

function unsharpMask(data, width, height, amount) {
  const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
  const out = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const i = (y * width + x) * 4 + c;
        out[i] = Math.max(0, Math.min(255, data[i] + (sum * amount) / 8));
      }
    }
  }
  return out;
}
