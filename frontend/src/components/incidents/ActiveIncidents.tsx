import { useState } from 'react';

export interface IncidentItem {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium';
  analyst: string;
  status: string;
  timeOpen: string;
  vector: string;
}

const mockIncidents: IncidentItem[] = [
  {
    id: 'INC-8942',
    title: 'Adversary LLM Prompt Injection & System Data Leak',
    priority: 'critical',
    analyst: 'Alex Vance (Lead Tier-3)',
    status: 'In Progress',
    timeOpen: '18m ago',
    vector: 'AI Interface / API GW',
  },
  {
    id: 'INC-8939',
    title: 'Multi-Stage Ransomware Pre-execution (Shadow Copy Deletion)',
    priority: 'critical',
    analyst: 'Sarah Connor (Tier-2)',
    status: 'Escalated',
    timeOpen: '42m ago',
    vector: 'Endpoint Host-049',
  },
  {
    id: 'INC-8935',
    title: 'Anomalous Data Volume Transfer to Uncategorized IP',
    priority: 'high',
    analyst: 'Michael Chang (Tier-2)',
    status: 'Triaged',
    timeOpen: '1h 15m ago',
    vector: 'Egress Traffic Gateway',
  },
];

const ActiveIncidents = () => {
  const [incidents, setIncidents] = useState(mockIncidents);

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
        <div className="incidents-grid">
          {incidents.map((inc) => (
            <div key={inc.id} className="incident-card">
              <div className="incident-card-header">
                <span className="incident-id">{inc.id}</span>
                <span className={`severity-pill ${inc.priority}`}>{inc.priority}</span>
              </div>

              <div className="incident-title">{inc.title}</div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Vector: <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{inc.vector}</span>
              </div>

              <div className="incident-meta">
                <span>Analyst: <strong style={{ color: 'var(--text-main)' }}>{inc.analyst}</strong></span>
                <span>Open: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{inc.timeOpen}</strong></span>
              </div>

              <div className="incident-actions">
                <button className="btn-soc-primary" style={{ flex: 1 }}>
                  Investigate
                </button>
                <button className="btn-soc-secondary" onClick={() => handleClose(inc.id)}>
                  Close Case
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveIncidents;
