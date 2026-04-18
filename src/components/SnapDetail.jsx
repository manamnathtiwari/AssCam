// SnapDetail.jsx — full-screen modal with export buttons
import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { exportPNG, exportSVG, exportHTML, exportTXT, copyTextToClipboard } from '../utils/export';
import { encodeShare } from '../utils/share';

export default function SnapDetail({ snap, onClose }) {
  const store = useStore();
  const preRef = useRef(null);

  // Render the ASCII in modal
  useEffect(() => {
    if (!preRef.current || !snap.grid.length) return;
    const pre = preRef.current;
    pre.textContent = '';
    const frag = document.createDocumentFragment();
    for (let row = 0; row < snap.grid.length; row++) {
      if (row > 0) frag.appendChild(document.createTextNode('\n'));
      for (let col = 0; col < snap.grid[row].length; col++) {
        const cell = snap.grid[row][col];
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
  }, [snap]);

  // Esc to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleShare = () => {
    const url = encodeShare(snap.grid, snap.settings);
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      prompt('Share link:', url);
    });
  };

  const handleCopyText = async () => {
    await copyTextToClipboard(snap.grid);
    // brief feedback
    const btn = document.getElementById('snap-copy-text');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = 'Copy Text'; }, 1500); }
  };

  const s = snap.settings;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="snap-detail" onClick={e => e.stopPropagation()}>
        <div className="snap-detail__header">
          <h2 className="snap-detail__title">
            Snap — {new Date(snap.timestamp).toLocaleString()}
          </h2>
          <button className="snap-detail__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="snap-detail__viewport" style={{ background: s.bgColor || '#0a0a0a' }}>
          <pre
            ref={preRef}
            style={{
              fontSize: `${Math.max(4, s.fontSize * 0.8)}px`,
              lineHeight: s.lineHeight,
              fontFamily: `"${s.fontFamily}", monospace`,
              fontWeight: s.bold ? 'bold' : 'normal',
              color: s.textColor || '#33ff33',
              margin: 0,
              padding: '12px',
              whiteSpace: 'pre',
              overflow: 'auto',
            }}
          />
        </div>

        <div className="snap-detail__actions">
          <div className="export-group">
            <span className="export-group__label">Export</span>
            <button className="btn btn--export" onClick={() => exportPNG(snap.grid, s, 2)} title="2× retina PNG">PNG 2×</button>
            <button className="btn btn--export" onClick={() => exportPNG(snap.grid, s, 4)} title="4× super PNG">PNG 4×</button>
            <button className="btn btn--export" onClick={() => exportSVG(snap.grid, s)}>SVG</button>
            <button className="btn btn--export" onClick={() => exportHTML(snap.grid, s)}>HTML</button>
            <button className="btn btn--export" onClick={() => exportTXT(snap.grid)}>TXT</button>
          </div>
          <div className="export-group">
            <span className="export-group__label">Share</span>
            <button id="snap-copy-text" className="btn btn--ghost" onClick={handleCopyText}>Copy Text</button>
            <button className="btn btn--primary" onClick={handleShare}>🔗 Share Link</button>
          </div>
          <button
            className="btn btn--danger"
            onClick={() => { store.removeSnap(snap.id); onClose(); }}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
