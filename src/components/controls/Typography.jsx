// Typography.jsx — font controls
import { useStore } from '../../store';
import ControlSlider from './ControlSlider';

const FONTS = [
  'Courier New',
  'Fira Code',
  'JetBrains Mono',
  'IBM Plex Mono',
  'Anonymous Pro',
];

export default function Typography() {
  const store = useStore();
  const s = (key, val) => store.set(key, val);

  return (
    <div className="control-group">
      <ControlSlider label="Font Size" id="font-size" value={store.fontSize} min={4} max={20} step={1} unit="px" onChange={v => s('fontSize', v)} format={v => Math.round(v)} />
      <ControlSlider label="Line Height" id="line-height" value={store.lineHeight} min={1.0} max={1.6} step={0.01} onChange={v => s('lineHeight', v)} />
      <ControlSlider label="Letter Spacing" id="letter-spacing" value={store.letterSpacing} min={-1} max={2} step={0.1} unit="px" onChange={v => s('letterSpacing', v)} />

      <div className="control-row">
        <label className="ctrl-label" htmlFor="font-family">Font Family</label>
        <select
          id="font-family"
          className="ctrl-select"
          value={store.fontFamily}
          onChange={e => s('fontFamily', e.target.value)}
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="control-row control-row--inline">
        <span className="ctrl-label">Bold</span>
        <button className={`toggle-btn ${store.bold ? 'toggle-btn--on' : ''}`} onClick={() => s('bold', !store.bold)}>
          {store.bold ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-row">
        <label className="ctrl-label">Background Color</label>
        <div className="color-picker-row">
          <input type="color" className="ctrl-color" value={store.bgColor} onChange={e => s('bgColor', e.target.value)} />
          <span className="ctrl-value">{store.bgColor}</span>
        </div>
      </div>

      <div className="control-row">
        <label className="ctrl-label">Text Color</label>
        <div className="color-picker-row">
          <input type="color" className="ctrl-color" value={store.textColor} onChange={e => s('textColor', e.target.value)} />
          <span className="ctrl-value">{store.textColor}</span>
        </div>
      </div>
    </div>
  );
}
