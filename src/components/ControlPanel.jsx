// ControlPanel.jsx — Modern Tabbed Sidebar
import { useState } from 'react';
import ModeSelector from './controls/ModeSelector';
import CharsetPicker from './controls/CharsetPicker';
import Typography from './controls/Typography';
import Adjustments from './controls/Adjustments';
import ColorPanel from './controls/ColorPanel';
import Effects from './controls/Effects';
import CameraControls from './controls/CameraControls';
import AutoTunePanel from './AutoTunePanel';

const TABS = [
  { id: 'mode',    label: 'Mode',      icon: '🎬', Component: ModeSelector,   props: {} },
  { id: 'charset', label: 'Charset',   icon: '🔤', Component: CharsetPicker,  props: {} },
  { id: 'typo',    label: 'Type',      icon: '✍️', Component: Typography,     props: {} },
  { id: 'adjust',  label: 'Tune',      icon: '🎚', Component: Adjustments,    props: {} },
  { id: 'color',   label: 'Color',     icon: '🎨', Component: ColorPanel,     props: {} },
  { id: 'effects', label: 'FX',        icon: '✨', Component: Effects,        props: {} },
  { id: 'camera',  label: 'Camera',    icon: '📷', Component: CameraControls, props: 'camera' },
];

export default function ControlPanel({ devices, onCameraRestart, autoEnabled, autoStatus, modelLoading, modelReady }) {
  const [activeTab, setActiveTab] = useState('mode');

  const activeTabData = TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabData.Component;
  const compProps = activeTabData.props === 'camera' ? { devices, onRestart: onCameraRestart } : {};
  const isLocked = autoEnabled && ['mode', 'adjust'].includes(activeTab);

  return (
    <aside className="control-panel" id="control-panel">
      {/* Smart Auto widget at top */}
      <AutoTunePanel
        status={autoStatus}
        modelLoading={modelLoading}
        modelReady={modelReady}
        autoEnabled={autoEnabled}
      />

      {/* Tab Navigation Ribbon */}
      <div className="tab-ribbon">
        {TABS.map(tab => {
          const locked = autoEnabled && ['mode', 'adjust'].includes(tab.id);
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''} ${locked ? 'tab-btn--locked' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={`${tab.label} ${locked ? '(Auto-Controlled)' : ''}`}
            >
              <span className="tab-btn__icon">{tab.icon}</span>
              <span className="tab-btn__label">{tab.label}</span>
              {locked && <span className="tab-btn__dot" />}
            </button>
          );
        })}
      </div>

      {/* Active Content Area */}
      <div className={`tab-content ${isLocked ? 'tab-content--locked' : ''}`}>
        <div className="tab-content__header">
          <h3>{activeTabData.icon} {activeTabData.label}</h3>
          {isLocked && <span className="tab-content__auto-badge">AI CONTROLLED</span>}
        </div>
        
        <div className="tab-content__body">
          <ActiveComponent {...compProps} />
        </div>
      </div>
    </aside>
  );
}
