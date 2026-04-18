// colorize.js — color transformations per pixel cell

export function applyColorMode(cell, settings) {
  const { renderMode, duoShadow, duoHighlight, neonHue, heatmapPreset, saturation, hueRotate, sepia } = settings;
  let { r, g, b, or: origR, og: origG, ob: origB, lum } = cell;

  let color = null;
  let bgColor = null;

  switch (renderMode) {
    case 'classic':
      color = settings.textColor || '#33ff33';
      break;

    case 'inverted':
      color = '#1a1a1a';
      bgColor = '#f5f5f5';
      break;

    case 'color': {
      let [h, s, l] = rgbToHsl(origR, origG, origB);
      s = Math.max(0, Math.min(1, s * saturation));
      h = (h + hueRotate / 360) % 1;
      const [nr, ng, nb] = hslToRgb(h, s, l);
      const sepiaBlend = sepia;
      const sr = Math.min(255, nr * (1 - sepiaBlend) + (nr * 0.393 + ng * 0.769 + nb * 0.189) * sepiaBlend);
      const sg = Math.min(255, ng * (1 - sepiaBlend) + (nr * 0.349 + ng * 0.686 + nb * 0.168) * sepiaBlend);
      const sb = Math.min(255, nb * (1 - sepiaBlend) + (nr * 0.272 + ng * 0.534 + nb * 0.131) * sepiaBlend);
      color = `rgb(${Math.round(sr)},${Math.round(sg)},${Math.round(sb)})`;
      break;
    }

    case 'duotone': {
      const t = lum / 255;
      const sc = hexToRgb(duoShadow || '#0d1117');
      const hc = hexToRgb(duoHighlight || '#58a6ff');
      const dr = Math.round(sc.r + (hc.r - sc.r) * t);
      const dg = Math.round(sc.g + (hc.g - sc.g) * t);
      const db = Math.round(sc.b + (hc.b - sc.b) * t);
      color = `rgb(${dr},${dg},${db})`;
      break;
    }

    case 'heatmap': {
      color = heatmapColor(lum / 255, heatmapPreset || 'hot');
      break;
    }

    case 'matrix':
      color = `hsl(120, 100%, ${30 + (lum / 255) * 50}%)`;
      break;

    case 'glitch': {
      // Slight color aberration on edges
      color = lum > 200 ? '#ff00ff' : lum > 100 ? '#00ffff' : '#33ff33';
      break;
    }

    case 'neon': {
      const hue = parseInt(neonHue) || 180;
      color = `hsl(${hue}, 100%, ${20 + (lum / 255) * 60}%)`;
      break;
    }

    case 'newspaper': {
      // Sepia-ish, desaturated
      const s2 = lum / 255;
      color = `rgb(${Math.round(180 * s2)},${Math.round(160 * s2)},${Math.round(110 * s2)})`;
      break;
    }

    case 'threshold':
      color = lum > 127 ? (settings.textColor || '#ffffff') : 'transparent';
      break;

    default:
      color = settings.textColor || '#33ff33';
  }

  return { color, bgColor };
}

function heatmapColor(t, preset) {
  const gradients = {
    hot:   [[0,0,255],[0,255,255],[0,255,0],[255,255,0],[255,0,0]],
    cool:  [[255,0,255],[0,0,255],[0,255,255]],
    viridis: [[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]],
    plasma: [[13,8,135],[156,23,158],[237,121,83],[240,249,33]],
    inferno: [[0,0,4],[120,28,109],[238,120,34],[252,255,164]],
    magma: [[0,0,4],[91,22,106],[229,105,56],[252,253,191]],
  };
  const stops = gradients[preset] || gradients.hot;
  const step = 1 / (stops.length - 1);
  const idx = Math.min(Math.floor(t / step), stops.length - 2);
  const local = (t - idx * step) / step;
  const a = stops[idx], b = stops[idx + 1];
  const r = Math.round(a[0] + (b[0]-a[0]) * local);
  const g = Math.round(a[1] + (b[1]-a[1]) * local);
  const bv = Math.round(a[2] + (b[2]-a[2]) * local);
  return `rgb(${r},${g},${bv})`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 255, b: 0 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    };
    const q = l < 0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l - q;
    r = hue2rgb(p, q, h+1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h-1/3);
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}
