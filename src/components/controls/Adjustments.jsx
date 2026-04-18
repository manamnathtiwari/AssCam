// Adjustments.jsx — image adjustments: brightness, contrast, gamma, sobel, etc.
import { useStore } from '../../store';
import ControlSlider from './ControlSlider';

export default function Adjustments() {
  const store = useStore();
  const s = (key, val) => store.set(key, val);

  return (
    <div className="control-group">
      <ControlSlider label="Brightness" id="brightness" value={store.brightness} min={-100} max={100} step={1} onChange={v => s('brightness', v)} format={v => (v > 0 ? '+' : '') + Math.round(v)} />
      <ControlSlider label="Contrast" id="contrast" value={store.contrast} min={0.5} max={3.0} step={0.05} unit="×" onChange={v => s('contrast', v)} />
      <ControlSlider label="Gamma" id="gamma" value={store.gamma} min={0.3} max={3.0} step={0.05} onChange={v => s('gamma', v)} />
      <ControlSlider label="Sharpen" id="sharpen" value={store.sharpen} min={0} max={2} step={0.1} onChange={v => s('sharpen', v)} />
      <ControlSlider label="Denoise" id="denoise" value={store.denoise} min={0} max={3} step={1} unit=" passes" onChange={v => s('denoise', v)} format={v => Math.round(v)} />

      <div className="control-row control-row--inline">
        <span className="ctrl-label">Histogram Equalization</span>
        <button className={`toggle-btn ${store.histEq ? 'toggle-btn--on' : ''}`} onClick={() => s('histEq', !store.histEq)}>
          {store.histEq ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-row control-row--inline">
        <span className="ctrl-label">Edge Detection (Sobel)</span>
        <button className={`toggle-btn ${store.sobelOn ? 'toggle-btn--on' : ''}`} onClick={() => s('sobelOn', !store.sobelOn)}>
          {store.sobelOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {store.sobelOn && (
        <ControlSlider label="Edge Threshold" id="sobel-threshold" value={store.sobelThreshold} min={10} max={120} step={1} onChange={v => s('sobelThreshold', v)} format={v => Math.round(v)} />
      )}
    </div>
  );
}
