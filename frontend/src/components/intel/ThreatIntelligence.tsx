import { useEffect, useState } from 'react';
import { threatService, ThreatIndicatorInfo } from '../../services/threatService';

const ThreatIntelligence = ({ lastEvent }: { lastEvent?: any }) => {
  const [indicators, setIndicators] = useState<ThreatIndicatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    threatService.getIndicators()
      .then(setIndicators)
      .catch((err) => {
        setError('Failed to load indicators');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update indicators in real-time when new WebSocket threat events arrive
  useEffect(() => {
    if (lastEvent && lastEvent.indicators) {
      setIndicators((prev) => {
        let updated = [...prev];
        lastEvent.indicators.forEach((newInd: any) => {
          const matchIndex = updated.findIndex((x) => x.indicator === newInd.value);
          if (matchIndex > -1) {
            updated[matchIndex] = {
              ...updated[matchIndex],
              count: updated[matchIndex].count + 1,
              last_seen: new Date().toISOString(),
            };
          } else {
            updated.push({
              indicator: newInd.value,
              type: newInd.type || 'pattern',
              first_seen: new Date().toISOString(),
              last_seen: new Date().toISOString(),
              count: 1,
              categories: [lastEvent.category || 'general'],
            });
          }
        });
        return updated;
      });
    }
  }, [lastEvent]);

  const ipCount = indicators.filter(x => x.type === 'ip' || x.type === 'ipv4').length;
  const urlCount = indicators.filter(x => x.type === 'url').length;
  const patternCount = indicators.filter(x => x.type === 'pattern').length;

  const iocs = [
    { label: 'Payload Patterns', value: patternCount.toString(), color: 'var(--primary-blue)' },
    { label: 'Suspicious URLs', value: urlCount.toString(), color: 'var(--status-warning)' },
    { label: 'Threat IPs', value: ipCount.toString(), color: 'var(--status-critical)' },
  ];

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🧠</span>
          Threat Intelligence IOC Feed
        </div>
        <span className="soc-panel-badge" style={{ color: 'var(--primary-blue)' }}>
          {indicators.length} Active IOCs
        </span>
      </div>

      <div className="soc-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* IOC Metric Summary */}
        <div className="stats-grid responsive-grid" style={{ gap: 10 }}>
          {iocs.map((ioc) => (
            <div
              key={ioc.label}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                padding: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{ioc.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: ioc.color, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {ioc.value}
              </div>
            </div>
          ))}
        </div>

        {/* Latest Indicators list */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            RECENTLY EXTRACTED TELEMETRY INDICATORS
          </div>
          {loading && <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Loading indicators...</div>}
          {error && <div style={{ padding: 12, textAlign: 'center', color: 'var(--status-critical)', fontSize: '0.78rem' }}>{error}</div>}
          {!loading && !error && indicators.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
              No threat indicators detected yet.
            </div>
          )}
          {!loading && !error && indicators.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {indicators.slice(0, 5).map((ind, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)' }}>
                      [{ind.type.toUpperCase()}]
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }} title={ind.indicator}>
                      {ind.indicator}
                    </span>
                  </div>
                  <span className="severity-pill medium" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                    {ind.count} seen
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
