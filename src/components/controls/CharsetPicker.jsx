// CharsetPicker.jsx — Character ramp selection + custom input + preview
import { useStore } from '../../store';
import { CHAR_RAMPS, RAMP_LABELS } from '../../engine/charmap';

export default function CharsetPicker() {
  const store = useStore();

  const activeRamp = store.charsetCustom
    ? store.customChars
    : (CHAR_RAMPS[store.charsetPreset] || CHAR_RAMPS.standard);

  const displayRamp = store.invertRamp
    ? activeRamp.split('').reverse().join('')
    : activeRamp;

  return (
    <div className="control-group">
      {/* Preset ramps */}
      <div className="ramp-presets">
        {Object.keys(CHAR_RAMPS).map(key => (
          <label key={key} className={`ramp-option ${!store.charsetCustom && store.charsetPreset === key ? 'ramp-option--active' : ''}`}>
            <input
              type="radio"
              name="charset"
              value={key}
              checked={!store.charsetCustom && store.charsetPreset === key}
              onChange={() => { store.set('charsetPreset', key); store.set('charsetCustom', false); }}
            />
            <span className="ramp-option__label">{RAMP_LABELS[key]}</span>
            <span className="ramp-option__preview">{CHAR_RAMPS[key].slice(0, 8)}…</span>
          </label>
        ))}
        <label className={`ramp-option ${store.charsetCustom ? 'ramp-option--active' : ''}`}>
          <input
            type="radio"
            name="charset"
            value="custom"
            checked={store.charsetCustom}
            onChange={() => store.set('charsetCustom', true)}
          />
          <span className="ramp-option__label">Custom</span>
        </label>
      </div>

      {/* Custom input */}
      {store.charsetCustom && (
        <div className="control-row">
          <label className="ctrl-label">Custom chars (light → dark)</label>
          <input
            className="ctrl-text-input"
            type="text"
            value={store.customChars}
            onChange={e => store.set('customChars', e.target.value || ' ')}
            placeholder="e.g.  .:-=+*#%@"
          />
        </div>
      )}

      {/* Ramp preview */}
      <div className="ramp-preview-container">
        <span className="ctrl-label">Preview</span>
        <div className="ramp-preview">
          {displayRamp.split('').map((ch, i) => (
            <span
              key={i}
              className="ramp-char"
              style={{
                color: `hsl(120,100%,${20 + (i / displayRamp.length) * 60}%)`,
                opacity: 0.4 + (i / displayRamp.length) * 0.6,
              }}
            >
              {ch === ' ' ? '·' : ch}
            </span>
          ))}
        </div>
      </div>

      {/* Invert toggle */}
      <div className="control-row control-row--inline">
        <span className="ctrl-label">Invert ramp</span>
        <button
          className={`toggle-btn ${store.invertRamp ? 'toggle-btn--on' : ''}`}
          onClick={() => store.set('invertRamp', !store.invertRamp)}
        >
          {store.invertRamp ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
