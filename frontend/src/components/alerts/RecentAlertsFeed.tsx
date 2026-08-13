import { useEffect, useState } from 'react';
import { dashboardService, DashboardAlert } from '../../services/dashboardService';

export interface AlertItem {
  id: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
}

function mapToAlertItems(data: DashboardAlert[]): AlertItem[] {
  return data.map((item) => ({
    id: item.id,
    time: item.time || '',
    severity: (['critical', 'high', 'medium', 'low'].includes(item.severity) ? item.severity : 'medium') as AlertItem['severity'],
    title: item.title || '—',
    description: item.description || '',
    source: item.source || '—',
  }));
}

const RecentAlertsFeed = ({ lastEvent }: { lastEvent?: any }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getAlerts()
      .then((data) => setAlerts(mapToAlertItems(data)))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.status === 'cleared' || lastEvent.severity === 'low') {
        return;
      }
      if (alerts.some((item) => item.id === lastEvent.id)) {
        return;
      }
      const mapped: AlertItem = {
        id: lastEvent.id,
        time: 'Just now',
        severity: (['critical', 'high', 'medium', 'low'].includes(lastEvent.severity) ? lastEvent.severity : 'medium') as AlertItem['severity'],
        title: lastEvent.threat || lastEvent.rule_name || '—',
        description: lastEvent.recommendation || '',
        source: lastEvent.source || '—',
      };
      setAlerts((prev) => {
        const updated = [mapped, ...prev];
        return updated.slice(0, 10);
      });
    }
  }, [lastEvent]);

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🔔</span>
          Recent Security Alerts & Signals
        </div>
        <span className="soc-panel-badge" style={{ color: alerts.length > 0 ? 'var(--status-critical)' : 'var(--text-muted)' }}>
          {alerts.length > 0 ? `${alerts.length} Unresolved` : 'No alerts'}
        </span>
      </div>

      <div className="soc-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>Loading alerts...</div>
        )}
        {!loading && alerts.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
            No active threats. System is clean.
          </div>
        )}
        {!loading && alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`severity-pill ${alert.severity}`}>{alert.severity}</span>
                <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-main)' }}>
                  {alert.title}
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {alert.time}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
              {alert.description}
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Source: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{alert.source}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlertsFeed;
