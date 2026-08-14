import { useState, useEffect } from 'react';
import { dashboardService, DashboardActivity } from '../../services/dashboardService';

const filters = ['All', 'Critical', 'High', 'Medium', 'Low'] as const;
type Filter = typeof filters[number];

const ThreatMonitor = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [threats, setThreats] = useState<DashboardActivity[]>([]);

  useEffect(() => {
    dashboardService.getActivity().then(setThreats).catch(() => setThreats([]));
  }, []);

  const filteredThreats = activeFilter === 'All'
    ? threats
    : threats.filter(
        (t) => t.severity.toLowerCase() === activeFilter.toLowerCase()
      );

  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Threat Monitor</h1>
          <p className="page-header-subtitle">
            Real-time detection center — {threats.length} active threats
          </p>
        </div>
        <button className="action-btn primary">Export Report</button>
      </div>

      {/* Summary row */}
      <div className="stats-grid responsive-grid">
        <div className="stat-card threats">
          <div className="stat-card-header">
            <span className="stat-card-label">Critical</span>
            <div className="stat-card-icon">🔴</div>
          </div>
          <div className="stat-card-value">3</div>
          <div className="stat-card-footer">Active threats</div>
        </div>
        <div className="stat-card cpu">
          <div className="stat-card-header">
            <span className="stat-card-label">High</span>
            <div className="stat-card-icon">🟠</div>
          </div>
          <div className="stat-card-value">3</div>
          <div className="stat-card-footer">Active threats</div>
        </div>
        <div className="stat-card memory">
          <div className="stat-card-header">
            <span className="stat-card-label">Medium</span>
            <div className="stat-card-icon">🟡</div>
          </div>
          <div className="stat-card-value">2</div>
          <div className="stat-card-footer">Active threats</div>
        </div>
        <div className="stat-card blocked">
          <div className="stat-card-header">
            <span className="stat-card-label">Low</span>
            <div className="stat-card-icon">🟢</div>
          </div>
          <div className="stat-card-value">2</div>
          <div className="stat-card-footer">Active threats</div>
        </div>
      </div>

      {/* Filters */}
      <div className="threat-filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
            id={`filter-${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-card-title-icon">⚡</span>
            Live Threat Feed
          </div>
          <span className="page-header-badge live">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            LIVE
          </span>
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
              {filteredThreats.map((item: DashboardActivity) => (
                <tr key={item.id}>
                  <td><span className="threat-time">{item.time}</span></td>
                  <td>
                    <div className="threat-name">
                      <span className="threat-name-dot" style={{
                        background:
                          item.severity === 'critical' ? 'var(--status-critical)' :
                          item.severity === 'high' ? 'var(--status-high)' :
                          item.severity === 'medium' ? 'var(--status-medium)' :
                          'var(--status-low)'
                      }} />
                      {item.threat || item.rule_name || 'Unknown Threat'}
                    </div>
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.source}</span></td>
                  <td><span className={`badge ${item.severity}`}>{item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}</span></td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      <span className="status-dot" />
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn">Investigate</button>
                      <button className="action-btn primary">Block</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ThreatMonitor;
