// Viewport.jsx — Live ASCII <pre> viewport with snap button
import { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';

export default function Viewport({ charGrid, onSnap }) {
  const store = useStore();
  const preRef = useRef(null);

  const {
    fontSize, lineHeight, letterSpacing, fontFamily, bold,
    bgColor, scanlines, scanlinesOpacity, crtWarp, renderMode,
  } = store;

  // Determine if we need colored spans or just text
  const needsColor = ['color', 'duotone', 'heatmap', 'matrix', 'glitch', 'neon', 'newspaper'].includes(renderMode);

  // Build the text content or colored HTML
  useEffect(() => {
    if (!preRef.current || !charGrid.length) return;
    const pre = preRef.current;

    if (!needsColor) {
      // Fast path: plain text
      pre.textContent = charGrid.map(row => row.map(c => c.char).join('')).join('\n');
      pre.style.color = charGrid[0]?.[0]?.color || store.textColor;
    } else {
      // Color path: spans
      pre.textContent = '';
      const frag = document.createDocumentFragment();
      for (let row = 0; row < charGrid.length; row++) {
        if (row > 0) frag.appendChild(document.createTextNode('\n'));
        for (let col = 0; col < charGrid[row].length; col++) {
          const cell = charGrid[row][col];
          if (cell.char === ' ') {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.textContent = cell.char;
            span.style.color = cell.color || '#33ff33';
            frag.appendChild(span);
          }
        }
      }
      pre.appendChild(frag);
    }
  }, [charGrid, needsColor, store.textColor, renderMode]);

  const handleSnap = useCallback(async () => {
    // Flash effect
    const viewport = document.querySelector('.viewport-wrapper');
    viewport?.classList.add('snap-flash');
    setTimeout(() => viewport?.classList.remove('snap-flash'), 300);
    onSnap?.();
  }, [onSnap]);

  // Keyboard shortcut: Space to snap
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleSnap();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSnap]);

  const viewportStyle = {
    background: bgColor || '#0a0a0a',
  };

  const preStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    letterSpacing: `${letterSpacing}px`,
    fontFamily: `"${fontFamily}", monospace`,
    fontWeight: bold ? 'bold' : 'normal',
    color: store.textColor,
    margin: 0,
    padding: '8px',
    whiteSpace: 'pre',
    overflow: 'hidden',
    flex: 1,
    userSelect: 'none',
  };

  return (
    <div className={`viewport-wrapper ${crtWarp ? 'crt-warp' : ''}`} style={viewportStyle}>
      {/* Scanlines overlay */}
      {scanlines && (
        <div
          className="scanlines-overlay"
          style={{ opacity: scanlinesOpacity }}
        />
      )}

      {/* Vignette overlay */}
      <div className="vignette-overlay" style={{ opacity: store.vignette }} />

      {/* ASCII output */}
      <pre ref={preRef} style={preStyle} id="ascii-viewport" />

      {/* Snap button */}
      <div className="snap-btn-container">
        <button
          id="snap-button"
          className="snap-btn"
          onClick={handleSnap}
          title="Take a snap (Space)"
          aria-label="Take ASCII art snapshot"
        >
          <span className="snap-btn__ring" />
          <span className="snap-btn__inner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="8"/>
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
            </svg>
          </span>
        </button>
        <span className="snap-hint">SPACE to snap</span>
      </div>

      {/* Matrix rain overlay */}
      {renderMode === 'matrix' && <MatrixRain />}
    </div>
  );
}

function MatrixRain() {
  return (
    <div className="matrix-rain-overlay" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="matrix-column" style={{ left: `${(i / 12) * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }}>
          {Array.from({ length: 8 }).map((__, j) => (
            <span key={j}>{String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
