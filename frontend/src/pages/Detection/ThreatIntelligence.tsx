import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { threatService, ThreatIntelligenceData, ThreatStats } from '../../services/threatService';

const ThreatIntelligence = () => {
  const [intel, setIntel] = useState<ThreatIntelligenceData | null>(null);
  const [summary, setSummary] = useState<ThreatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      threatService.getIntelligence(),
      threatService.getStats()
    ])
      .then(([intelData, summaryData]) => {
        setIntel(intelData);
        setSummary(summaryData);
      })
      .catch((err) => {
        setError('Failed to load threat intelligence telemetry');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalDetections = summary ? summary.threats_found : 0;
  const activeIndicatorsCount = intel ? intel.indicators.length : 0;

  const cards = [
    { title: 'Total Detections', value: totalDetections > 0 ? `${totalDetections} events` : 'No events', icon: '🔥' },
    { title: 'Top Threat Category', value: intel?.recent_categories?.[0]?.category || 'None detected', icon: '📈' },
    { title: 'Active Indicators (IOCs)', value: activeIndicatorsCount > 0 ? `${activeIndicatorsCount} active` : 'None detected', icon: '🌐' },
    { title: 'Top MITRE Technique', value: intel?.top_techniques?.[0]?.technique || 'None detected', icon: '⚔️' },
  ];

  return (
    <div className="page-shell">
      <PageHeader title="Threat Intelligence & Indicators" />
      
      {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading threat intelligence...</div>}
      {error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--status-critical)' }}>{error}</div>}
      
      {!loading && !error && intel && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="intel-grid">
            {cards.map((card) => (
              <div className="intel-card" key={card.title}>
                <div className="intel-card-icon">{card.icon}</div>
                <div>
                  <div className="intel-card-title">{card.title}</div>
                  <div className="intel-card-value">{card.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="soc-grid-2col">
            <div className="section-card">
              <div className="section-card-header">
                <div className="section-card-title">Trending Threat Categories</div>
              </div>
              <div className="section-card-body">
                {intel.recent_categories.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--text-muted)', textAlign: 'center' }}>No threat category trends to display.</div>
                ) : (
                  <div className="trend-list">
                    {intel.recent_categories.map((trend) => (
                      <div key={trend.category} className="trend-item">
                        <span>{trend.category}</span>
                        <strong>{trend.count}</strong>
                      </div>
                    ))}
                  </div>
                )}
                {summary && (
                  <div className="stat-blocks" style={{ marginTop: 20 }}>
                    <div className="stat-block">
                      <span>Total Scans</span>
                      <strong>{summary.total_scans}</strong>
                    </div>
                    <div className="stat-block">
                      <span>Threats Found</span>
                      <strong>{summary.threats_found}</strong>
                    </div>
                    <div className="stat-block">
                      <span>Critical</span>
                      <strong>{summary.critical}</strong>
                    </div>
                    <div className="stat-block">
                      <span>High</span>
                      <strong>{summary.high}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <div className="section-card-title">Top MITRE ATT&CK Techniques</div>
              </div>
              <div className="section-card-body">
                {intel.top_techniques.length === 0 ? (
                  <div style={{ padding: 16, color: 'var(--text-muted)', textAlign: 'center' }}>No MITRE techniques mapped yet.</div>
                ) : (
                  <div className="trend-list">
                    {intel.top_techniques.map((tech) => (
                      <div key={tech.technique_id} className="trend-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tech.technique}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginLeft: 8 }}>({tech.technique_id})</span>
                        </div>
                        <strong>{tech.count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">Extracted Indicators of Compromise (IOCs)</div>
            </div>
            <div className="section-card-body" style={{ overflowX: 'auto' }}>
              {intel.indicators.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No indicators extracted or stored yet.</div>
              ) : (
                <table className="soc-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: 10, color: 'var(--text-dim)' }}>Indicator Value</th>
                      <th style={{ padding: 10, color: 'var(--text-dim)' }}>Type</th>
                      <th style={{ padding: 10, color: 'var(--text-dim)' }}>First Seen</th>
                      <th style={{ padding: 10, color: 'var(--text-dim)' }}>Last Seen</th>
                      <th style={{ padding: 10, color: 'var(--text-dim)', textAlign: 'right' }}>Detections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intel.indicators.map((ind, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                        <td style={{ padding: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{ind.indicator}</td>
                        <td style={{ padding: 10 }}><span className="severity-pill medium" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{ind.type}</span></td>
                        <td style={{ padding: 10, color: 'var(--text-dim)' }}>{ind.first_seen ? new Date(ind.first_seen).toLocaleString() : '—'}</td>
                        <td style={{ padding: 10, color: 'var(--text-dim)' }}>{ind.last_seen ? new Date(ind.last_seen).toLocaleString() : '—'}</td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 600 }}>{ind.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelligence;
