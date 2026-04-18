// useAutoTune.js — Smart Auto-Tune: heuristic analysis + TF.js face detection
// Option 1: Per-frame metrics (luminance, contrast, edge density, saturation)
// Option 2: BlazeFace ML face detection (loaded lazily, no blocking)

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';

const ANALYSIS_INTERVAL_MS = 700; // analyze every 700ms
const LERP = 0.18;               // smoothing factor for slider transitions
const AW = 160, AH = 90;        // analysis canvas size (low-res = fast)

// Module-level face model cache (persist across hook re-mounts)
let tfFaceModel = null;
let tfModelLoading = false;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function round2(v) { return Math.round(v * 100) / 100; }

export function useAutoTune(videoRef, ready, enabled) {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const [status, setStatus] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(!!tfFaceModel);

  // Init low-res analysis canvas
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = AW; c.height = AH;
    canvasRef.current = c;
  }, []);

  // ── Load BlazeFace model lazily ─────────────────────────────────────────────
  const loadFaceModel = useCallback(async () => {
    if (tfFaceModel || tfModelLoading) return;
    tfModelLoading = true;
    setModelLoading(true);
    try {
      // Dynamic imports = zero cost until first activation
      const tf = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      await tf.setBackend('webgl');
      await tf.ready();
      const blazeface = await import('@tensorflow-models/blazeface');
      tfFaceModel = await blazeface.load({ maxFaces: 5 });
      setModelReady(true);
      console.info('[ASSCam AutoTune] BlazeFace model loaded ✓');
    } catch (err) {
      console.warn('[ASSCam AutoTune] Face model failed — using heuristics only:', err.message);
      setModelReady(false);
    } finally {
      tfModelLoading = false;
      setModelLoading(false);
    }
  }, []);

  // ── Core analysis function ──────────────────────────────────────────────────
  const analyze = useCallback(async () => {
    if (!enabledRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    // Draw low-res frame
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, AW, AH);
    const { data } = ctx.getImageData(0, 0, AW, AH);
    const n = AW * AH;

    // ── Step 1: Compute pixel metrics ─────────────────────────
    const gray = new Float32Array(n);
    let sumLum = 0, sumLumSq = 0, sumSat = 0, edgeCount = 0;

    for (let i = 0; i < n; i++) {
      const pi = i * 4;
      const r = data[pi], g = data[pi + 1], b = data[pi + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[i] = lum;
      sumLum += lum;
      sumLumSq += lum * lum;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      sumSat += mx > 0 ? (mx - mn) / mx : 0;
    }

    // Edge density via fast gradient approximation
    for (let y = 1; y < AH - 1; y++) {
      for (let x = 1; x < AW - 1; x++) {
        const mag =
          Math.abs(gray[y * AW + x + 1] - gray[y * AW + x - 1]) +
          Math.abs(gray[(y + 1) * AW + x] - gray[(y - 1) * AW + x]);
        if (mag > 36) edgeCount++;
      }
    }

    const meanLum   = sumLum / n;
    const stdLum    = Math.sqrt(Math.max(0, sumLumSq / n - meanLum * meanLum));
    const meanSat   = sumSat / n;
    const edgeDensity = edgeCount / ((AW - 2) * (AH - 2));

    // ── Step 2: Face detection (if model loaded) ──────────────
    let faceCount = 0, faceProbability = 0;
    if (tfFaceModel) {
      try {
        const predictions = await tfFaceModel.estimateFaces(canvas, false);
        faceCount = predictions.length;
        if (faceCount > 0) {
          faceProbability = predictions[0].probability?.[0] ?? 0.85;
        }
      } catch { /* ignore inference errors */ }
    }

    // ── Step 3: Scene classification ─────────────────────────
    const isDark        = meanLum < 55;
    const isBright      = meanLum > 185;
    const isLowContrast = stdLum < 28;
    const isHighContrast= stdLum > 70;
    const isColorful    = meanSat > 0.22;
    const hasEdges      = edgeDensity > 0.11;
    const hasFace       = faceCount > 0 && faceProbability > 0.60;

    // How much to correct brightness toward ideal (128)
    const lumCorr = clamp((128 - meanLum) * 0.12, -30, 30);

    let scene, icon, description, recs;

    if (hasFace) {
      // ▶ PORTRAIT — face(s) detected, use ultra-dense + Sobel for photorealism
      scene = 'face';
      icon  = '🎭';
      description = `${faceCount} face${faceCount > 1 ? 's' : ''} detected (${(faceProbability * 100).toFixed(0)}% conf)`;
      recs = {
        renderMode:     'classic',
        charsetPreset:  'ultraDense',
        charsetCustom:  false,
        sobelOn:        true,
        sobelThreshold: clamp(50 - edgeDensity * 150, 20, 65),
        histEq:         true,
        contrast:       1.85,
        gamma:          0.82,
        brightness:     clamp(lumCorr, -20, 20),
        vignette:       0.30,
        saturation:     0.95,
      };

    } else if (isDark) {
      // ▶ DARK — low-light scene → neon mode for visibility
      scene = 'dark';
      icon  = '🌑';
      description = `Low light — ${meanLum.toFixed(0)} avg lum`;
      recs = {
        renderMode:    'neon',
        charsetPreset: 'standard',
        charsetCustom: false,
        sobelOn:       false,
        histEq:        true,
        contrast:      1.65,
        gamma:         1.40,
        brightness:    clamp(lumCorr * 1.6, 15, 45),
        neonHue:       160,
        saturation:    1.25,
        vignette:      0.20,
      };

    } else if (isBright) {
      // ▶ OVEREXPOSED — blow-out → invert to preserve detail
      scene = 'bright';
      icon  = '☀️';
      description = `Overexposed — ${meanLum.toFixed(0)} avg lum`;
      recs = {
        renderMode:    'inverted',
        charsetPreset: 'standard',
        charsetCustom: false,
        sobelOn:       hasEdges,
        sobelThreshold: 50,
        histEq:        false,
        contrast:      1.10,
        gamma:         1.25,
        brightness:    clamp(lumCorr, -35, 0),
        saturation:    1.00,
        vignette:      0.0,
      };

    } else if (isColorful && !isLowContrast) {
      // ▶ COLORFUL — vibrant scene → color mode
      scene = 'colorful';
      icon  = '🌈';
      description = `Vibrant — ${(meanSat * 100).toFixed(0)}% saturation`;
      recs = {
        renderMode:    'color',
        charsetPreset: 'standard',
        charsetCustom: false,
        sobelOn:       hasEdges,
        sobelThreshold: 45,
        histEq:        false,
        contrast:      clamp(1.1 + (0.28 - meanSat) * 2, 1.0, 1.6),
        gamma:         1.00,
        brightness:    clamp(lumCorr, -15, 15),
        saturation:    1.40,
        vignette:      0.10,
      };

    } else if (isHighContrast && hasEdges) {
      // ▶ HIGH DETAIL — sharp scene → ultra-dense + strong Sobel
      scene = 'highContrast';
      icon  = '⚡';
      description = `High detail — ${(edgeDensity * 100).toFixed(0)}% edges`;
      recs = {
        renderMode:    'classic',
        charsetPreset: 'ultraDense',
        charsetCustom: false,
        sobelOn:       true,
        sobelThreshold: clamp(55 + (edgeDensity - 0.2) * 100, 30, 90),
        histEq:        false,
        contrast:      clamp(stdLum / 33, 1.3, 2.5),
        gamma:         1.00,
        brightness:    clamp(lumCorr, -15, 15),
        saturation:    1.00,
        vignette:      0.15,
      };

    } else if (isLowContrast) {
      // ▶ FLAT — featureless scene → boost contrast, histogram eq
      scene = 'flat';
      icon  = '🌫️';
      description = `Low detail — σ=${stdLum.toFixed(0)}`;
      recs = {
        renderMode:    'inverted',
        charsetPreset: 'minimal',
        charsetCustom: false,
        sobelOn:       false,
        histEq:        true,
        contrast:      1.65,
        gamma:         0.90,
        brightness:    clamp(lumCorr, -20, 20),
        saturation:    1.00,
        vignette:      0.0,
      };

    } else {
      // ▶ GENERAL — balanced scene → standard settings
      scene = 'general';
      icon  = '🎞️';
      description = `Balanced scene`;
      recs = {
        renderMode:    'classic',
        charsetPreset: 'standard',
        charsetCustom: false,
        sobelOn:       hasEdges,
        sobelThreshold: 40,
        histEq:        stdLum < 38,
        contrast:      clamp(1.15 + (stdLum / 55) * 0.45, 1.0, 1.80),
        gamma:         1.00,
        brightness:    clamp(lumCorr, -20, 20),
        saturation:    1.00,
        vignette:      0.0,
      };
    }

    // ── Step 4: Apply recommendations ────────────────────────
    applyRecommendations(recs);

    setStatus({
      scene, icon, description,
      faceCount, faceProbability,
      meanLum, stdLum, edgeDensity, meanSat,
      modelAvailable: !!tfFaceModel,
    });

  }, [videoRef]);

  // ── Start / stop loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !ready) {
      clearInterval(intervalRef.current);
      setStatus(null);
      return;
    }
    // Kick off model load (async, non-blocking)
    loadFaceModel();
    // Immediate first run, then interval
    analyze();
    intervalRef.current = setInterval(analyze, ANALYSIS_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [enabled, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, modelLoading, modelReady };
}

// ── Apply with smooth lerp via Zustand getState() ─────────────────────────────
function applyRecommendations(recs) {
  const state = useStore.getState();

  // Discrete/boolean keys — apply immediately
  const discrete = ['renderMode', 'charsetPreset', 'charsetCustom', 'sobelOn', 'histEq'];
  discrete.forEach(key => {
    if (recs[key] !== undefined && state[key] !== recs[key]) {
      state.set(key, recs[key]);
    }
  });

  // Special: neonHue only when in neon mode
  if (recs.neonHue !== undefined) state.set('neonHue', recs.neonHue);

  // Numeric sliders — lerp for smooth animation
  const numeric = ['contrast', 'gamma', 'brightness', 'sobelThreshold', 'vignette', 'saturation'];
  numeric.forEach(key => {
    if (recs[key] === undefined) return;
    const cur = state[key] ?? 0;
    const target = recs[key];
    const next = round2(lerp(cur, target, LERP));
    if (Math.abs(next - cur) > 0.005) {
      state.set(key, next);
    }
  });
}
