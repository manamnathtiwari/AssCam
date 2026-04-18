// CameraControls.jsx — device, flip, resolution, frame cap
import { useStore } from '../../store';

const RESOLUTIONS = ['320x240', '640x480', '1280x720'];
const FRAMECAPS = [10, 20, 30];

export default function CameraControls({ devices, onRestart }) {
  const store = useStore();
  const s = (key, val) => store.set(key, val);

  return (
    <div className="control-group">
      <div className="control-row">
        <label className="ctrl-label" htmlFor="camera-device">Camera</label>
        <select
          id="camera-device"
          className="ctrl-select"
          value={store.deviceId || ''}
          onChange={e => { s('deviceId', e.target.value || null); setTimeout(onRestart, 100); }}
        >
          <option value="">Default Camera</option>
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="control-row control-row--inline">
        <span className="ctrl-label">Flip Horizontal</span>
        <button className={`toggle-btn ${store.flipH ? 'toggle-btn--on' : ''}`} onClick={() => { s('flipH', !store.flipH); setTimeout(onRestart, 100); }}>
          {store.flipH ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="control-row">
        <span className="ctrl-label">Resolution</span>
        <div className="radio-group">
          {RESOLUTIONS.map(r => (
            <label key={r} className={`radio-option ${store.resolution === r ? 'radio-option--active' : ''}`}>
              <input
                type="radio"
                name="resolution"
                value={r}
                checked={store.resolution === r}
                onChange={() => { s('resolution', r); setTimeout(onRestart, 100); }}
              />
              {r}
            </label>
          ))}
        </div>
      </div>

      <div className="control-row">
        <span className="ctrl-label">Frame Rate Cap</span>
        <div className="radio-group">
          {FRAMECAPS.map(f => (
            <label key={f} className={`radio-option ${store.frameCap === f ? 'radio-option--active' : ''}`}>
              <input
                type="radio"
                name="framecap"
                value={f}
                checked={store.frameCap === f}
                onChange={() => s('frameCap', f)}
              />
              {f}fps
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn--ghost btn--full" onClick={onRestart}>
        ↺ Restart Camera
      </button>
    </div>
  );
}
