import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { threatService, ThreatStats } from '../../services/threatService';

const ThreatStatistics = () => {
  const [stats, setStats] = useState<ThreatStats | null>(null);

  useEffect(() => {
    threatService.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="page-shell">
      <PageHeader title="Threat Statistics" />
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Threat Detection Metrics</div>
        </div>
        <div className="section-card-body">
          {!stats && <div className="status-message info">Loading threat statistics...</div>}
          {stats && (
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-card-label">Total Scans</div>
                <div className="stat-card-value">{stats.total_scans}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Threats Found</div>
                <div className="stat-card-value">{stats.threats_found}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Critical</div>
                <div className="stat-card-value">{stats.critical}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">High</div>
                <div className="stat-card-value">{stats.high}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Medium</div>
                <div className="stat-card-value">{stats.medium}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Low</div>
                <div className="stat-card-value">{stats.low}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatStatistics;
