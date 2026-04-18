// store.js — Zustand global state for all ASSCam controls
import { create } from 'zustand';
import { BUILT_IN_PRESETS, loadUserPresets, saveUserPreset, deleteUserPreset } from './utils/presets';

const DEFAULT_STATE = {
  // Render mode
  renderMode: 'classic',

  // Character set
  charsetPreset: 'standard',
  charsetCustom: false,
  customChars: ' .:-=+*#%@',
  invertRamp: false,

  // Typography
  fontSize: 8,
  lineHeight: 1.15,
  letterSpacing: 0,
  fontFamily: 'Courier New',
  bold: false,
  bgColor: '#0a0a0a',
  textColor: '#33ff33',

  // Image adjustments
  brightness: 0,
  contrast: 1.2,
  gamma: 1.0,
  sharpen: 0,
  denoise: 0,
  histEq: false,
  sobelOn: false,
  sobelThreshold: 40,

  // Color & palette
  saturation: 1.0,
  hueRotate: 0,
  sepia: 0,
  duoShadow: '#0d1117',
  duoHighlight: '#58a6ff',
  heatmapPreset: 'hot',
  neonHue: 180,

  // Effects
  vignette: 0,
  scanlines: false,
  scanlinesOpacity: 0.3,
  crtWarp: false,
  glitchIntensity: 0.5,
  noise: 0,
  mirrorH: false,
  mirrorV: false,
  zoom: 1,

  // Camera
  deviceId: null,
  flipH: false,
  resolution: '640x480',
  frameCap: 30,

  // Gallery
  snaps: [],

  // Presets
  activePreset: null,
  userPresets: [],
};

export const useStore = create((set, get) => ({
  ...DEFAULT_STATE,
  userPresets: loadUserPresets(),

  // Generic setter
  set: (key, value) => set({ [key]: value }),

  // Batch update for presets
  applyPreset: (preset) => set({ ...DEFAULT_STATE, ...preset.settings, activePreset: preset.name }),

  // Save current state as user preset
  savePreset: (name) => {
    const state = get();
    const settings = {};
    Object.keys(DEFAULT_STATE).forEach(k => { if (k !== 'snaps' && k !== 'userPresets' && k !== 'activePreset') settings[k] = state[k]; });
    const preset = { name, settings };
    saveUserPreset(preset);
    set(s => ({ userPresets: [...s.userPresets.filter(p => p.name !== name), preset], activePreset: name }));
  },

  deletePreset: (name) => {
    deleteUserPreset(name);
    set(s => ({ userPresets: s.userPresets.filter(p => p.name !== name) }));
  },

  // Gallery
  addSnap: (snap) => set(s => ({ snaps: [snap, ...s.snaps] })),
  removeSnap: (id) => set(s => ({ snaps: s.snaps.filter(sn => sn.id !== id) })),
}));

export { BUILT_IN_PRESETS };
