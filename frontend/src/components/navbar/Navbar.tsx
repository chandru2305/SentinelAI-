import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  pageTitle?: string;
}

const Navbar = ({ pageTitle = 'SOC Overview' }: NavbarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [env, setEnv] = useState('Prod-US-East-1');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="topbar-container">
      <div className="topbar-left">
        <div className="topbar-brand">
          <div className="topbar-brand-icon">🛡️</div>
          <span>SentinelAI</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--bg-dark)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            {pageTitle}
          </span>
        </div>

        <div className="topbar-search-wrapper">
          <span className="topbar-search-icon">🔍</span>
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search IP, Hash, CVE, MITRE Technique or Threat Actor..."
            aria-label="Global Search"
          />
          <span className="topbar-search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Environment Selector */}
        <div className="env-selector" title="Selected Environment">
          <span className="env-status-dot"></span>
          <span>ENV:</span>
          <select value={env} onChange={(e) => setEnv(e.target.value)}>
            <option value="Prod-US-East-1">Prod-US-East-1</option>
            <option value="Prod-EU-West-1">Prod-EU-West-1</option>
            <option value="GovCloud-US">GovCloud-US</option>
            <option value="Staging-Global">Staging-Global</option>
          </select>
        </div>

        {/* Live Clock */}
        <div className="topbar-clock">
          <span className="clock-time">{formattedTime} UTC</span>
          <span className="clock-date">{formattedDate}</span>
        </div>

        {/* Notifications */}
        <button className="topbar-action-btn" title="Security Notifications">
          🔔
          <span className="topbar-notif-dot"></span>
        </button>

        {/* Settings */}
        <button className="topbar-action-btn" title="SOC Settings" onClick={() => navigate('/settings')}>
          ⚙️
        </button>

        {/* User Profile */}
        <div className="user-profile-badge" onClick={() => navigate('/profile')}>
          <div className="user-avatar">SA</div>
          <div className="user-info">
            <span className="user-name">Alex Vance</span>
            <span className="user-role">Lead Tier-3 Analyst</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
