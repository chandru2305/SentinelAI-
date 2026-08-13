const Profile = () => {
  const activityItems = [
    { action: 'Investigated threat: Prompt Injection', time: '12 min ago', icon: '🔍' },
    { action: 'Generated weekly security report', time: '2 hrs ago', icon: '📊' },
    { action: 'Updated AI model configuration', time: '5 hrs ago', icon: '🤖' },
    { action: 'Blocked malicious IP range', time: '1 day ago', icon: '🚫' },
    { action: 'Reviewed 48 security alerts', time: '1 day ago', icon: '🚨' },
  ];

  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Profile</h1>
          <p className="page-header-subtitle">Account details and recent activity</p>
        </div>
        <button className="action-btn primary">Edit Profile</button>
      </div>

      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">👤</div>
        <div>
          <div className="profile-name">Admin User</div>
          <div className="profile-role-badge">🛡️ SOC Analyst</div>
          <div className="profile-email">admin@sentinelai.local</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, textAlign: 'center' }}>
          {[
            { label: 'Threats Investigated', value: '2,847' },
            { label: 'Incidents Resolved', value: '1,293' },
            { label: 'Reports Generated', value: '86' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details + Activity */}
      <div className="dashboard-grid-3col">
        <div className="settings-section">
          <div className="settings-section-header"><span>👤</span> Account Details</div>
          {[
            ['Username', 'admin'],
            ['Email', 'admin@sentinelai.local'],
            ['Role', 'SOC Analyst'],
            ['Department', 'Security Operations'],
            ['Joined', 'January 15, 2025'],
            ['Last Login', 'Jul 31, 2026 · 12:47'],
            ['Status', 'Active'],
          ].map(([k, v]) => (
            <div key={k} className="settings-row">
              <div className="settings-row-label">{k}</div>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-accent)', fontFamily: k === 'Username' || k === 'Email' ? 'var(--font-mono)' : undefined }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <span className="section-card-title-icon">📅</span>
              Recent Activity
            </div>
          </div>
          <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activityItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>{item.action}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
