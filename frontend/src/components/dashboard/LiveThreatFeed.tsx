import { useEffect, useState } from 'react';
import { dashboardService, DashboardActivity } from '../../services/dashboardService';

export interface ThreatFeedItem {
  id: string;
  time: string;
  ip: string;
  threatType: string;
  mitre: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: string;
  status: 'Blocked' | 'Quarantined' | 'Investigating' | 'Resolved';
}

function mapToFeedItems(data: DashboardActivity[]): ThreatFeedItem[] {
  return data.map((item) => ({
    id: item.id,
    time: item.time || '—',
    ip: item.source || '—',
    threatType: item.threat || item.rule_name || '—',
    mitre: '—',
    severity: (['critical', 'high', 'medium', 'low'].includes(item.severity) ? item.severity : 'low') as ThreatFeedItem['severity'],
    confidence: item.confidence != null ? `${item.confidence}%` : '—',
    status: (item.status === 'detected' ? 'Investigating' : item.status === 'cleared' ? 'Resolved' : 'Blocked') as ThreatFeedItem['status'],
  }));
}

const LiveThreatFeed = ({ lastEvent }: { lastEvent?: any }) => {
  const [feed, setFeed] = useState<ThreatFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getActivity()
      .then((data) => setFeed(mapToFeedItems(data)))
      .catch(() => setFeed([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lastEvent) {
      if (feed.some((item) => item.id === lastEvent.id)) {
        return;
      }
      const mapped: ThreatFeedItem = {
        id: lastEvent.id,
        time: lastEvent.time || '—',
        ip: lastEvent.source || '—',
        threatType: lastEvent.threat || lastEvent.rule_name || '—',
        mitre: lastEvent.mitre?.technique_id || '—',
        severity: (['critical', 'high', 'medium', 'low'].includes(lastEvent.severity) ? lastEvent.severity : 'low') as ThreatFeedItem['severity'],
        confidence: lastEvent.confidence != null ? `${lastEvent.confidence}%` : '—',
        status: (lastEvent.status === 'detected' ? 'Investigating' : lastEvent.status === 'cleared' ? 'Resolved' : 'Blocked') as ThreatFeedItem['status'],
      };
      setFeed((prev) => {
        const updated = [mapped, ...prev];
        return updated.slice(0, 50);
      });
    }
  }, [lastEvent]);

  const handleAction = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Blocked' } : item
      )
    );
  };

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">⚡</span>
          Live Threat Feed & Event Stream
        </div>
        <div className="attack-live-indicator">
          <span className="attack-ping-dot" style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
          {feed.length > 0 ? 'LIVE DATA' : 'NO EVENTS'}
        </div>
      </div>

      <div className="soc-panel-body" style={{ padding: 0 }}>
        {loading && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading threat feed...</div>
        )}
        {!loading && feed.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            No threat events detected. Run a scan from the Threat Detection page to generate data.
          </div>
        )}
        {!loading && feed.length > 0 && (
          <div className="soc-table-wrapper">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>Source IP</th>
                  <th>Threat Vector</th>
                  <th>MITRE ATT&CK</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.time}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.ip}</td>
                    <td style={{ fontWeight: 600 }}>{item.threatType}</td>
                    <td>
                      <span className="mitre-badge">{item.mitre}</span>
                    </td>
                    <td>
                      <span className={`severity-pill ${item.severity}`}>{item.severity}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)' }}>{item.confidence}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color:
                            item.status === 'Blocked' || item.status === 'Quarantined'
                              ? 'var(--status-success)'
                              : item.status === 'Investigating'
                              ? 'var(--status-warning)'
                              : 'var(--text-muted)',
                        }}
                      >
                        ● {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-soc-primary" onClick={() => handleAction(item.id)}>
                        Isolate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveThreatFeed;
