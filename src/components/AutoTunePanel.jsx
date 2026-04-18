// AutoTunePanel.jsx — Sidebar widget (NOT a floating overlay)
import { useEffect, useState } from 'react';

const SCENE_THEMES = {
  face:         { gradient: 'linear-gradient(135deg, #0a1f12 0%, #0d2318 100%)', accent: '#3fb950', icon: '🎭', label: 'Portrait Mode' },
  dark:         { gradient: 'linear-gradient(135deg, #130d1e 0%, #1a0f2e 100%)', accent: '#a371f7', icon: '🌑', label: 'Low Light' },
  bright:       { gradient: 'linear-gradient(135deg, #1a1400 0%, #241c00 100%)', accent: '#d29922', icon: '☀️', label: 'Overexposed' },
  colorful:     { gradient: 'linear-gradient(135deg, #0d1a2d 0%, #0a1525 100%)', accent: '#58a6ff', icon: '🌈', label: 'Colorful Scene' },
  highContrast: { gradient: 'linear-gradient(135deg, #1a0d0d 0%, #200f0f 100%)', accent: '#f85149', icon: '⚡', label: 'High Detail' },
  flat:         { gradient: 'linear-gradient(135deg, #111620 0%, #151a24 100%)', accent: '#8b949e', icon: '🌫️', label: 'Flat / Soft' },
  general:      { gradient: 'linear-gradient(135deg, #0d1117 0%, #111620 100%)', accent: '#58a6ff', icon: '🎞️', label: 'Balanced' },
};

export default function AutoTunePanel({ status, modelLoading, modelReady, autoEnabled }) {
  const [prevScene, setPrevScene] = useState(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!status || status.scene === prevScene) return;
    setPrevScene(status.scene);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }, [status?.scene]);

  if (!autoEnabled) return null;

  const theme = status ? (SCENE_THEMES[status.scene] || SCENE_THEMES.general) : SCENE_THEMES.general;

  return (
    <div
      className={`at-widget ${pulse ? 'at-widget--pulse' : ''}`}
      style={{ '--atc': theme.accent, background: theme.gradient }}
    >
      {/* Top row */}
      <div className="at-widget__top">
        <div className="at-widget__indicator">
          <span className="at-widget__dot" style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
          <span className="at-widget__title">SMART AUTO</span>
        </div>
        <div className="at-widget__badges">
          {modelLoading && <span className="at-badge at-badge--loading">Loading AI</span>}
          {modelReady && !modelLoading && <span className="at-badge at-badge--ai">🧠 AI</span>}
        </div>
      </div>

      {/* Scene display */}
      {status ? (
        <>
          <div className="at-widget__scene">
            <span className="at-widget__scene-icon">{theme.icon}</span>
            <div>
              <div className="at-widget__scene-label" style={{ color: theme.accent }}>{theme.label}</div>
              <div className="at-widget__scene-desc">{status.description}</div>
            </div>
          </div>

          {/* Face row */}
          {status.modelAvailable && status.faceCount > 0 && (
            <div className="at-widget__face">
              <span>👤</span>
              <span>{status.faceCount} face{status.faceCount > 1 ? 's' : ''} · {(status.faceProbability * 100).toFixed(0)}% confidence</span>
            </div>
          )}

          {/* Metrics */}
          <div className="at-widget__metrics">
            <Metric label="Brightness" value={status.meanLum} max={255} color="#f0b429" />
            <Metric label="Contrast"   value={status.stdLum}  max={100} color="#58a6ff" />
            <Metric label="Edges"      value={status.edgeDensity * 100} max={40} color="#3fb950" unit="%" />
            <Metric label="Saturation" value={status.meanSat * 100}     max={60} color="#a371f7" unit="%" />
          </div>
        </>
      ) : (
        <div className="at-widget__scanning">
          <div className="at-scanning-dots">
            <span /><span /><span />
          </div>
          <span>Analyzing scene…</span>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, max, color, unit = '' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="at-metric">
      <span className="at-metric__label">{label}</span>
      <div className="at-metric__track">
        <div className="at-metric__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="at-metric__val" style={{ color }}>{value.toFixed(0)}{unit}</span>
    </div>
  );
}
