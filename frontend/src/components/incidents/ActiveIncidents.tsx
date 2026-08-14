import { useState, useEffect } from 'react';
import { dashboardService, DashboardActivity } from '../../services/dashboardService';

const ActiveIncidents = () => {
  const [incidents, setIncidents] = useState<DashboardActivity[]>([]);

  useEffect(() => {
    dashboardService.getActivity()
      .then((data) => setIncidents(data.filter(item => item.status === 'detected' || item.status === 'investigating')))
      .catch(() => setIncidents([]));
  }, []);

  const handleClose = (id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🚨</span>
          Active Security Incidents ({incidents.length})
        </div>
        <button className="btn-soc-secondary">View All Cases →</button>
      </div>

      <div className="soc-panel-body">
        {incidents.length === 0 ? (
          <div className="incident-empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
            <h4>No Active Incidents</h4>
            <p style={{ fontSize: '0.9rem' }}>All AI security events have been resolved or mitigated.</p>
          </div>
        ) : (
          <div className="incident-list">
            {incidents.map((inc) => (
              <div key={inc.id} className={`incident-card sev-${inc.severity}`}>
                <div className="incident-header">
                  <div className="incident-id mono">{inc.id.substring(0, 8).toUpperCase()}</div>
                  <div className="incident-time">{inc.time}</div>
                </div>
                <div className="incident-title">{inc.threat || inc.rule_name || 'AI Security Threat'}</div>
                <div className="incident-meta">
                  <span className={`incident-badge ${inc.severity}`}>
                    {inc.severity.toUpperCase()}
                  </span>
                  <span className="incident-vector">{inc.source || 'AI Interface'}</span>
                </div>
                <div className="incident-footer">
                  <div className="incident-analyst">Assigned: SOC Team</div>
                  <div className="incident-actions">
                    <button className="action-btn small outline">Triage</button>
                    <button className="action-btn small primary" onClick={() => handleClose(inc.id)}>Close</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveIncidents;
