// App.jsx — Ultra-friendly floating glass layout
import { useCallback, useState } from 'react';
import Header from './components/Header';
import Viewport from './components/Viewport';
import ControlPanel from './components/ControlPanel';
import Gallery from './components/Gallery';
import { useCamera } from './hooks/useCamera';
import { useASCIIEngine } from './hooks/useASCIIEngine';
import { useAutoTune } from './hooks/useAutoTune';
import { useStore } from './store';

export default function App() {
  const store = useStore();
  const [autoEnabled, setAutoEnabled] = useState(false);

  const { videoRef, devices, error, ready, restart } = useCamera(
    store.deviceId,
    store.resolution,
    store.flipH
  );

  const { charGrid, snap } = useASCIIEngine(videoRef, ready);

  const { status: autoStatus, modelLoading, modelReady } = useAutoTune(
    videoRef,
    ready,
    autoEnabled
  );

  const handleSnap = useCallback(async () => {
    const snapData = await snap();
    if (snapData) store.addSnap(snapData);
  }, [snap, store]);

  return (
    <div className="app ambient-theme">
      {/* Animated beautiful background blobs */}
      <div className="ambient-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Hidden video element */}
      <video
        ref={videoRef}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        playsInline
        muted
        aria-hidden="true"
      />

      <div className="app-content">
        <Header
          autoEnabled={autoEnabled}
          onToggleAuto={() => setAutoEnabled(p => !p)}
          autoStatus={autoStatus}
        />

        <main className="main-layout glass-panels">
          {/* ── Center: ASCII Viewport ─────────────────────────────────── */}
          <div className="viewport-container glass-card">
            {error ? (
              <div className="onboarding-state error-state">
                <div className="state-icon">📷</div>
                <h2 className="state-title">Camera Required</h2>
                <p className="state-desc">Please allow camera access to start creating ASCII art.</p>
                <button className="btn btn--primary btn--large" onClick={restart}>Enable Camera</button>
              </div>
            ) : !ready ? (
              <div className="onboarding-state loading-state">
                <div className="spinner-ring" />
                <h2 className="state-title">Warming up the engine...</h2>
                <p className="state-desc">Preparing your ASCII studio.</p>
              </div>
            ) : (
              <Viewport charGrid={charGrid} onSnap={handleSnap} />
            )}
          </div>

          {/* ── Right: Control Panel ── */}
          <div className="sidebar-container glass-card">
            <ControlPanel
              devices={devices}
              onCameraRestart={restart}
              autoEnabled={autoEnabled}
              autoStatus={autoStatus}
              modelLoading={modelLoading}
              modelReady={modelReady}
            />
          </div>
        </main>

        <div className="gallery-container glass-card">
          <Gallery />
        </div>
      </div>
    </div>
  );
}
