import { useState, useEffect } from 'react';
import { dashboardService, DashboardSystem } from '../../services/dashboardService';
import { aiService, AIModelInfo } from '../../services/aiService';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [aiScan, setAiScan] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const [system, setSystem] = useState<DashboardSystem | null>(null);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState<string>('');
  const [isChangingModel, setIsChangingModel] = useState(false);

  useEffect(() => {
    dashboardService.getSystem().then(sys => {
      setSystem(sys);
      setActiveModel(sys.model_loaded);
    }).catch(console.error);

    aiService.models().then(res => {
      setModels(res.models);
    }).catch(console.error);
  }, []);

  const handleModelChange = async (newModel: string) => {
    setActiveModel(newModel);
    setIsChangingModel(true);
    try {
      await aiService.changeModel({ model: newModel });
      const sys = await dashboardService.getSystem();
      setSystem(sys);
    } catch (err) {
      console.error('Failed to change model', err);
    } finally {
      setIsChangingModel(false);
    }
  };

  const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
    id,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    id: string;
  }) => (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{description}</div>
      </div>
      <label className="toggle-switch" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );

  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p className="page-header-subtitle">System configuration and preferences</p>
        </div>
        <button className="action-btn primary">Save Changes</button>
      </div>

      <div className="settings-grid">
        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span>🔔</span>
            Notifications
          </div>
          <ToggleRow id="notif-push" label="Push Notifications" description="Receive browser push notifications for alerts" checked={notifications} onChange={setNotifications} />
          <ToggleRow id="notif-email" label="Email Alerts" description="Send critical alerts to registered email address" checked={emailAlerts} onChange={setEmailAlerts} />
        </div>

        {/* Security */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span>🛡️</span>
            Security
          </div>
          <ToggleRow id="sec-autoblock" label="Auto-Block Threats" description="Automatically block detected threats before intervention" checked={autoBlock} onChange={setAutoBlock} />
          <ToggleRow id="sec-2fa" label="Two-Factor Authentication" description="Enable 2FA for all admin accounts" checked={twoFactor} onChange={setTwoFactor} />
        </div>

        {/* AI Engine */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span>🤖</span>
            AI Engine
          </div>
          <ToggleRow id="ai-scan" label="Continuous AI Scanning" description="Run AI model scans continuously in the background" checked={aiScan} onChange={setAiScan} />
          <div className="settings-row">
            <div>
              <div className="settings-row-label">AI Model {isChangingModel && <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>(changing...)</span>}</div>
              <div className="settings-row-desc">Select the active inference model</div>
            </div>
            <select
              id="ai-model-select"
              value={activeModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={isChangingModel || models.length === 0}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontSize: '0.83rem',
                outline: 'none',
                minWidth: 150
              }}
            >
              {models.length === 0 && <option value={activeModel || ''}>{activeModel || 'Loading...'}</option>}
              {models.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span>🎨</span>
            Appearance
          </div>
          <ToggleRow id="ui-dark" label="Dark Mode" description="Use dark color scheme (recommended for SOC environments)" checked={darkMode} onChange={setDarkMode} />
        </div>

        {/* System Info */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span>ℹ️</span>
            System Information
          </div>
          {[
            ['Application', 'SentinelAI'],
            ['Version', '0.4.0'],
            ['Environment', 'Production'],
            ['Backend', 'FastAPI 0.115.x'],
            ['AI Runtime', system?.ollama_status === 'Running' ? 'Ollama Online' : 'AI Offline'],
            ['Database', 'SQLite (Fallback)'],
          ].map(([k, v]) => (
            <div key={k} className="settings-row">
              <div className="settings-row-label">{k}</div>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-accent)' }}>
                {v}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
