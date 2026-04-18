// Header.jsx — Premium redesigned header
import { useState } from 'react';
import { useStore, BUILT_IN_PRESETS } from '../store';

export default function Header({ autoEnabled, onToggleAuto, autoStatus }) {
  const store = useStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const allPresets = [...BUILT_IN_PRESETS, ...store.userPresets];

  const handleApplyPreset = (preset) => store.applyPreset(preset);

  const handleSavePreset = () => {
    if (presetName.trim()) {
      store.savePreset(presetName.trim());
      setPresetName('');
      setShowSaveModal(false);
    }
  };

  const sceneLabel = autoStatus
    ? ({ face: 'Portrait', dark: 'Night', bright: 'Bright', colorful: 'Color', highContrast: 'Detail', flat: 'Soft', general: 'Auto' }[autoStatus.scene] || 'Auto')
    : null;

  return (
    <>
      <header className="header">
        {/* Logo */}
        <div className="header-logo">
          <span className="logo-text">
            <span className="logo-ass">ASS</span><span className="logo-cam">CAM</span>
          </span>
          <span className="logo-pill">STUDIO</span>
        </div>

        <div className="header-divider" />

        {/* Preset bar */}
        <div className="header-presets">
          <span className="header-presets__label">Presets</span>
          <div className="preset-scroll">
            {allPresets.map(p => (
              <button
                key={p.name}
                className={`preset-pill ${store.activePreset === p.name ? 'preset-pill--active' : ''}`}
                onClick={() => handleApplyPreset(p)}
                title={p.name}
              >
                {p.icon} {p.name}
              </button>
            ))}
            <button
              className="preset-pill preset-pill--add"
              onClick={() => setShowSaveModal(true)}
              title="Save current as preset"
            >
              + Save
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="header-actions">
          {/* Smart Auto toggle */}
          <button
            id="smart-auto-btn"
            className={`smart-auto-btn ${autoEnabled ? 'smart-auto-btn--on' : ''}`}
            onClick={onToggleAuto}
            title={autoEnabled ? 'Disable Smart Auto-Tune' : 'Enable Smart Auto (heuristic + face detection)'}
          >
            <span className="smart-auto-btn__icon">{autoEnabled ? '✦' : '✧'}</span>
            <span className="smart-auto-btn__label">
              {autoEnabled && autoStatus
                ? `${autoStatus.icon} ${sceneLabel}`
                : 'Smart Auto'}
            </span>
            {autoEnabled && <span className="smart-auto-btn__ring" />}
          </button>

          {/* Live badge */}
          <div className="live-badge">
            <span className="live-badge__dot" />
            LIVE
          </div>
        </div>
      </header>

      {/* Save preset modal */}
      {showSaveModal && (
        <div className="modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={e => e.stopPropagation()}>
            <h3 className="save-modal__title">Save Current Settings</h3>
            <input
              className="save-modal__input"
              type="text"
              placeholder="Give your preset a name…"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
              autoFocus
            />
            <div className="save-modal__actions">
              <button className="btn btn--ghost" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSavePreset}>Save Preset</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
