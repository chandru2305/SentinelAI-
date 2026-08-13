import { useEffect, useState } from 'react';
import { dashboardService, DashboardActivity } from '../../services/dashboardService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getActivity()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const getLevel = (severity: string, status: string) => {
    if (status === 'cleared') return 'success';
    if (severity === 'critical' || severity === 'high') return 'error';
    if (severity === 'medium') return 'warn';
    return 'info';
  };

  const stats = {
    errors: logs.filter(l => getLevel(l.severity, l.status) === 'error').length,
    warnings: logs.filter(l => getLevel(l.severity, l.status) === 'warn').length,
    info: logs.filter(l => getLevel(l.severity, l.status) === 'info').length,
    success: logs.filter(l => getLevel(l.severity, l.status) === 'success').length,
  };

  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Activity Logs</h1>
          <p className="page-header-subtitle">System and security event log stream</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn">Export Logs</button>
          <button className="action-btn primary" disabled={logs.length === 0}>Clear Logs</button>
        </div>
      </div>

      <div className="stats-grid responsive-grid">
        <div className="stat-card threats">
          <div className="stat-card-header">
            <span className="stat-card-label">Errors</span>
            <div className="stat-card-icon">❌</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats.errors}</div>
          <div className="stat-card-footer">Recent</div>
        </div>
        <div className="stat-card cpu">
          <div className="stat-card-header">
            <span className="stat-card-label">Warnings</span>
            <div className="stat-card-icon">⚠️</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats.warnings}</div>
          <div className="stat-card-footer">Recent</div>
        </div>
        <div className="stat-card health">
          <div className="stat-card-header">
            <span className="stat-card-label">Info</span>
            <div className="stat-card-icon">ℹ️</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats.info}</div>
          <div className="stat-card-footer">Recent</div>
        </div>
        <div className="stat-card blocked">
          <div className="stat-card-header">
            <span className="stat-card-label">Success</span>
            <div className="stat-card-icon">✅</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats.success}</div>
          <div className="stat-card-footer">Recent</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-card-title-icon">📋</span>
            System Log Stream
          </div>
          <span className={`page-header-badge ${logs.length > 0 ? 'live' : ''}`}>
            {logs.length > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4 }} />}
            {loading ? 'LOADING' : logs.length > 0 ? 'STREAMING' : 'NO EVENTS'}
          </span>
        </div>
        <div style={{ background: 'var(--bg-surface)', margin: '0', padding: '8px 4px' }}>
          {loading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading activity logs...</div>
          )}
          {!loading && logs.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              No system activity logs found.
            </div>
          )}
          {!loading && logs.map((entry) => {
            const level = getLevel(entry.severity, entry.status);
            return (
              <div key={entry.id} className="log-entry">
                <span className="log-timestamp">{entry.time || '—'}</span>
                <span className={`log-level ${level}`}>{level.toUpperCase()}</span>
                <span className="log-message">
                  {entry.source && <strong>[{entry.source}] </strong>}
                  {entry.threat} - {entry.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;

