// presets.js — built-in presets + localStorage CRUD

export const BUILT_IN_PRESETS = [
  {
    name: 'Portrait',
    icon: '🎭',
    settings: {
      renderMode: 'classic',
      charsetPreset: 'ultraDense',
      charsetCustom: false,
      sobelOn: true,
      sobelThreshold: 40,
      contrast: 1.8,
      gamma: 0.8,
      histEq: true,
      brightness: 10,
      textColor: '#e8e8e8',
      bgColor: '#080808',
      fontSize: 7,
    }
  },
  {
    name: 'Matrix',
    icon: '🟩',
    settings: {
      renderMode: 'matrix',
      charsetPreset: 'standard',
      charsetCustom: false,
      textColor: '#00ff41',
      bgColor: '#0d0208',
      fontSize: 8,
      scanlines: true,
      scanlinesOpacity: 0.15,
      contrast: 1.5,
    }
  },
  {
    name: 'Vintage',
    icon: '📰',
    settings: {
      renderMode: 'newspaper',
      charsetPreset: 'ultraDense',
      charsetCustom: false,
      sepia: 0.6,
      fontFamily: 'Courier New',
      vignette: 0.4,
      contrast: 1.3,
      bgColor: '#f4e9d0',
      fontSize: 7,
    }
  },
  {
    name: 'Neon',
    icon: '💜',
    settings: {
      renderMode: 'neon',
      charsetPreset: 'standard',
      charsetCustom: false,
      fontFamily: 'Fira Code',
      fontSize: 10,
      contrast: 1.6,
      hueRotate: 270,
      neonHue: 270,
      bgColor: '#05010f',
    }
  },
  {
    name: 'Minimal',
    icon: '⬜',
    settings: {
      renderMode: 'inverted',
      charsetPreset: 'minimal',
      charsetCustom: false,
      bgColor: '#ffffff',
      textColor: '#1a1a1a',
      fontSize: 14,
      contrast: 1.4,
    }
  },
  {
    name: 'Glitch',
    icon: '⚡',
    settings: {
      renderMode: 'glitch',
      charsetPreset: 'binary',
      charsetCustom: false,
      sobelOn: true,
      sobelThreshold: 80,
      noise: 15,
      glitchIntensity: 0.8,
      bgColor: '#000000',
      contrast: 2.0,
      fontSize: 8,
    }
  },
];

const STORAGE_KEY = 'asscam_user_presets';

export function loadUserPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserPreset(preset) {
  const existing = loadUserPresets();
  const filtered = existing.filter(p => p.name !== preset.name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, preset]));
}

export function deleteUserPreset(name) {
  const existing = loadUserPresets();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(p => p.name !== name)));
}
