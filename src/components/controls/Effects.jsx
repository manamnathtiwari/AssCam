// Effects.jsx — vignette, scanlines, CRT, glitch, noise, mirror, zoom
import { useStore } from '../../store';
import ControlSlider from './ControlSlider';

export default function Effects() {
  const store = useStore();
  const s = (key, val) => store.set(key, val);

  return (
    <div className="control-group">
      <ControlSlider label="Vignette" id="vignette" value={store.vignette} min={0} max={1} step={0.01} onChange={v => s('vignette', v)} />

      <div className="control-row control-row--inline">
        <span className="ctrl-label">Scanlines</span>
        <button className={`toggle-btn ${store.scanlines ? 'toggle-btn--on' : ''}`} onClick={() => s('scanlines', !store.scanlines)}>
          {store.scanlines ? 'ON' : 'OFF'}
        </button>
      </div>
      {store.scanlines && (
        <ControlSlider label="Scanline Opacity" id="scanlines-opacity" value={store.scanlinesOpacity} min={0} max={1} step={0.01} onChange={v => s('scanlinesOpacity', v)} />
      )}

      <div className="control-row control-row--inline">
        <span className="ctrl-label">CRT Warp</span>
        <button className={`toggle-btn ${store.crtWarp ? 'toggle-btn--on' : ''}`} onClick={() => s('crtWarp', !store.crtWarp)}>
          {store.crtWarp ? 'ON' : 'OFF'}
        </button>
      </div>

      {store.renderMode === 'glitch' && (
        <ControlSlider label="Glitch Intensity" id="glitch-intensity" value={store.glitchIntensity} min={0} max={1} step={0.01} onChange={v => s('glitchIntensity', v)} />
      )}

      <ControlSlider label="Random Noise" id="noise" value={store.noise} min={0} max={50} step={0.5} unit="%" onChange={v => s('noise', v)} format={v => v.toFixed(1)} />

      <div className="control-row">
        <span className="ctrl-label">Mirror</span>
        <div className="mirror-btns">
          <button
            className={`mirror-btn ${store.mirrorH ? 'mirror-btn--active' : ''}`}
            onClick={() => s('mirrorH', !store.mirrorH)}
          >
            ↔ H
          </button>
          <button
            className={`mirror-btn ${store.mirrorV ? 'mirror-btn--active' : ''}`}
            onClick={() => s('mirrorV', !store.mirrorV)}
          >
            ↕ V
          </button>
          <button
            className={`mirror-btn ${store.mirrorH && store.mirrorV ? 'mirror-btn--active' : ''}`}
            onClick={() => { s('mirrorH', true); s('mirrorV', true); }}
          >
            ⊕ Both
          </button>
        </div>
      </div>

      <ControlSlider label="Zoom" id="zoom" value={store.zoom} min={1} max={4} step={0.1} unit="×" onChange={v => s('zoom', v)} />
    </div>
  );
}
