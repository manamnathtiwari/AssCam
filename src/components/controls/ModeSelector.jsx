// ModeSelector.jsx — Premium render mode cards
import { useStore } from '../../store';

const MODES = [
  { id: 'classic',   label: 'Classic',    icon: '⬛', color: '#56d364', desc: 'Dark bg, green chars' },
  { id: 'inverted',  label: 'Inverted',   icon: '⬜', color: '#e6edf3', desc: 'White bg, dark chars' },
  { id: 'color',     label: 'Color',      icon: '🌈', color: '#58a6ff', desc: 'Full camera colors' },
  { id: 'duotone',   label: 'Duotone',    icon: '🎨', color: '#f778ba', desc: 'Two-color gradient' },
  { id: 'heatmap',   label: 'Heatmap',    icon: '🔥', color: '#ff7b72', desc: 'Temperature colors' },
  { id: 'matrix',    label: 'Matrix',     icon: '💚', color: '#00ff41', desc: 'Green rain effect' },
  { id: 'glitch',    label: 'Glitch',     icon: '⚡', color: '#d2a8ff', desc: 'Digital glitch art' },
  { id: 'neon',      label: 'Neon',       icon: '💜', color: '#a371f7', desc: 'Glowing neon look' },
  { id: 'newspaper', label: 'Newspaper',  icon: '📰', color: '#d29922', desc: 'Sepia ink press' },
  { id: 'threshold', label: 'Threshold',  icon: '◼',  color: '#8b949e', desc: 'Pure black & white' },
];

export default function ModeSelector() {
  const store = useStore();

  return (
    <div className="mode-grid">
      {MODES.map(mode => {
        const active = store.renderMode === mode.id;
        return (
          <button
            key={mode.id}
            id={`mode-${mode.id}`}
            className={`mode-card ${active ? 'mode-card--active' : ''}`}
            onClick={() => store.set('renderMode', mode.id)}
            title={mode.desc}
            style={active ? { '--mc': mode.color } : {}}
          >
            <span className="mode-card__icon">{mode.icon}</span>
            <span className="mode-card__label">{mode.label}</span>
            {active && <span className="mode-card__active-dot" style={{ background: mode.color }} />}
          </button>
        );
      })}
    </div>
  );
}
