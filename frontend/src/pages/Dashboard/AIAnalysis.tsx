import AIStatusPanel from '../../components/dashboard/AIStatusPanel';
import {
  ThreatsPerDayChart,
  SeverityDistributionChart,
} from '../../components/charts/DashboardCharts';

const models = [
  { name: 'LLaMA 3.1 8B', status: 'active', type: 'Threat Detection', accuracy: '94.7%', latency: '143ms' },
  { name: 'Mistral 7B', status: 'standby', type: 'Anomaly Detection', accuracy: '91.2%', latency: '287ms' },
  { name: 'CodeLlama 13B', status: 'standby', type: 'Code Analysis', accuracy: '88.9%', latency: '412ms' },
  { name: 'Phi-3 Mini', status: 'offline', type: 'Log Analysis', accuracy: '85.1%', latency: 'N/A' },
];

const AIAnalysis = () => {
  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>AI Analysis</h1>
          <p className="page-header-subtitle">
            AI model management and threat analysis insights
          </p>
        </div>
        <span className="page-header-badge live">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          AI ACTIVE
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid responsive-grid">
        <div className="stat-card ai">
          <div className="stat-card-header">
            <span className="stat-card-label">Models Loaded</span>
            <div className="stat-card-icon">🤖</div>
          </div>
          <div className="stat-card-value">1 / 4</div>
          <div className="stat-card-footer">1 active · 2 standby · 1 offline</div>
        </div>
        <div className="stat-card threats">
          <div className="stat-card-header">
            <span className="stat-card-label">Scans Today</span>
            <div className="stat-card-icon">🔬</div>
          </div>
          <div className="stat-card-value">8,421</div>
          <div className="stat-card-footer">↑ 12% from yesterday</div>
        </div>
        <div className="stat-card blocked">
          <div className="stat-card-header">
            <span className="stat-card-label">AI Confidence</span>
            <div className="stat-card-icon">🎯</div>
          </div>
          <div className="stat-card-value">94.7%</div>
          <div className="stat-card-footer">Avg across all models</div>
        </div>
        <div className="stat-card memory">
          <div className="stat-card-header">
            <span className="stat-card-label">Avg Latency</span>
            <div className="stat-card-icon">⚡</div>
          </div>
          <div className="stat-card-value">143ms</div>
          <div className="stat-card-footer">P95: 312ms</div>
        </div>
      </div>

      {/* Models table */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-card-title-icon">🧠</span>
            AI Models
          </div>
          <button className="action-btn primary">Deploy Model</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="threat-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Purpose</th>
                <th>Accuracy</th>
                <th>Latency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.name}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.name}
                    </span>
                  </td>
                  <td>{m.type}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{m.accuracy}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{m.latency}</td>
                  <td>
                    <span className={`status-badge ${m.status === 'active' ? 'blocked' : m.status === 'standby' ? 'investigating' : 'detected'}`}>
                      <span className="status-dot" />
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn">Run Scan</button>
                      {m.status !== 'active' && (
                        <button className="action-btn primary">Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts + Status */}
      <div className="dashboard-grid-3col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ThreatsPerDayChart />
          <SeverityDistributionChart />
        </div>
        <AIStatusPanel />
      </div>
    </div>
  );
};

export default AIAnalysis;
