import { mockThreatActivity, ThreatActivity } from './ThreatData';

const ThreatActivityTable = () => {
  const severityLabel: Record<ThreatActivity['severity'], string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const statusLabel: Record<ThreatActivity['status'], string> = {
    blocked: 'Blocked',
    detected: 'Detected',
    investigating: 'Investigating',
    resolved: 'Resolved',
  };

  const severityDotColor: Record<ThreatActivity['severity'], string> = {
    critical: 'var(--status-critical)',
    high: 'var(--status-high)',
    medium: 'var(--status-medium)',
    low: 'var(--status-low)',
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-card-title-icon">⚡</span>
          Threat Activity Feed
        </div>
        <button className="section-card-action">View All →</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="threat-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Threat</th>
              <th>Source IP</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockThreatActivity.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="threat-time">{item.time}</span>
                </td>
                <td>
                  <div className="threat-name">
                    <span
                      className="threat-name-dot"
                      style={{ background: severityDotColor[item.severity] }}
                    />
                    {item.threat}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {item.source}
                  </span>
                </td>
                <td>
                  <span className={`badge ${item.severity}`}>
                    {severityLabel[item.severity]}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    <span className="status-dot" />
                    {statusLabel[item.status]}
                  </span>
                </td>
                <td>
                  <button className="action-btn">Investigate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatActivityTable;
