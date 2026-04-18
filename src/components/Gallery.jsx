// Gallery.jsx — horizontal scrollable strip of snap thumbnails
import { useState } from 'react';
import { useStore } from '../store';
import SnapDetail from './SnapDetail';

export default function Gallery() {
  const store = useStore();
  const [selectedSnap, setSelectedSnap] = useState(null);

  if (!store.snaps.length) {
    return (
      <div className="gallery gallery--empty">
        <span className="gallery__empty-text">
          📸 Your snaps will appear here — press <kbd>Space</kbd> or the shutter button to capture
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="gallery" id="gallery-strip">
        <div className="gallery__scroll">
          {store.snaps.map(snap => (
            <div
              key={snap.id}
              className="gallery__thumb-wrapper"
              onClick={() => setSelectedSnap(snap)}
            >
              <img
                src={snap.thumbnail}
                alt={`Snap ${new Date(snap.timestamp).toLocaleTimeString()}`}
                className="gallery__thumb"
                width={120}
                height={80}
              />
              <div className="gallery__thumb-overlay">
                <span className="gallery__thumb-time">
                  {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <button
                  className="gallery__thumb-delete"
                  onClick={e => { e.stopPropagation(); store.removeSnap(snap.id); }}
                  title="Delete"
                  aria-label="Delete snap"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="gallery__count">{store.snaps.length} snap{store.snaps.length !== 1 ? 's' : ''}</div>
      </div>

      {selectedSnap && (
        <SnapDetail
          snap={selectedSnap}
          onClose={() => setSelectedSnap(null)}
        />
      )}
    </>
  );
}
