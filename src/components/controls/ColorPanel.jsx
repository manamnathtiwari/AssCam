// ColorPanel.jsx — saturation, hue, sepia, duotone, heatmap, neon
import { useStore } from '../../store';
import ControlSlider from './ControlSlider';

const HEATMAP_PRESETS = ['hot', 'cool', 'viridis', 'plasma', 'inferno', 'magma'];

export default function ColorPanel() {
  const store = useStore();
  const s = (key, val) => store.set(key, val);
  const mode = store.renderMode;

  return (
    <div className="control-group">
      <ControlSlider label="Saturation" id="saturation" value={store.saturation} min={0} max={2} step={0.05} onChange={v => s('saturation', v)} />
      <ControlSlider label="Hue Rotate" id="hue-rotate" value={store.hueRotate} min={0} max={360} step={1} unit="°" onChange={v => s('hueRotate', v)} format={v => Math.round(v)} />
      <ControlSlider label="Sepia" id="sepia" value={store.sepia} min={0} max={1} step={0.01} onChange={v => s('sepia', v)} />

      {mode === 'duotone' && (
        <>
          <div className="control-row">
            <label className="ctrl-label">Shadow Color</label>
            <div className="color-picker-row">
              <input type="color" className="ctrl-color" value={store.duoShadow} onChange={e => s('duoShadow', e.target.value)} />
              <span className="ctrl-value">{store.duoShadow}</span>
            </div>
          </div>
          <div className="control-row">
            <label className="ctrl-label">Highlight Color</label>
            <div className="color-picker-row">
              <input type="color" className="ctrl-color" value={store.duoHighlight} onChange={e => s('duoHighlight', e.target.value)} />
              <span className="ctrl-value">{store.duoHighlight}</span>
            </div>
          </div>
        </>
      )}

      {mode === 'heatmap' && (
        <div className="control-row">
          <label className="ctrl-label">Gradient Preset</label>
          <div className="heatmap-presets">
            {HEATMAP_PRESETS.map(p => (
              <button
                key={p}
                className={`heatmap-chip ${store.heatmapPreset === p ? 'heatmap-chip--active' : ''}`}
                onClick={() => s('heatmapPreset', p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'neon' && (
        <div className="control-row">
          <label className="ctrl-label">Neon Hue</label>
          <div className="color-picker-row">
            <input
              type="range"
              className="ctrl-slider hue-slider"
              min={0}
              max={360}
              step={1}
              value={store.neonHue}
              onChange={e => s('neonHue', parseInt(e.target.value))}
            />
            <span className="ctrl-value" style={{ color: `hsl(${store.neonHue},100%,70%)` }}>{store.neonHue}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
