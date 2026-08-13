interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  time: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    title: 'Prompt Injection Detected',
    description: 'AI model manipulation attempt blocked from 185.220.101.45',
    severity: 'critical',
    icon: '💉',
    time: '2 min ago',
  },
  {
    id: '2',
    title: 'SQL Injection Attempt',
    description: 'Database query injection blocked on /api/users endpoint',
    severity: 'high',
    icon: '🗃️',
    time: '8 min ago',
  },
  {
    id: '3',
    title: 'Malware Signature Found',
    description: 'Trojan.Agent.Generic detected in uploaded file',
    severity: 'critical',
    icon: '🦠',
    time: '15 min ago',
  },
  {
    id: '4',
    title: 'Phishing Campaign',
    description: 'Mass phishing emails detected from spoofed domain',
    severity: 'high',
    icon: '🎣',
    time: '23 min ago',
  },
  {
    id: '5',
    title: 'Brute Force Login',
    description: 'Multiple failed login attempts from single IP address',
    severity: 'medium',
    icon: '🔓',
    time: '31 min ago',
  },
  {
    id: '6',
    title: 'Port Scan Detected',
    description: 'Sequential port scanning from 192.168.1.105',
    severity: 'low',
    icon: '🔍',
    time: '45 min ago',
  },
];

const RecentAlerts = () => {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-card-title-icon">🚨</span>
          Recent Alerts
        </div>
        <button className="section-card-action">Clear All</button>
      </div>
      <div className="section-card-body" style={{ padding: '12px 16px' }}>
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item ${alert.severity}`}>
            <div className="alert-icon">{alert.icon}</div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.description}</div>
            </div>
            <div className="alert-time">{alert.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
