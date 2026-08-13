import { useEffect, useState } from 'react';
import { threatService } from '../../services/threatService';

interface MitreTactic {
  id: string;
  name: string;
  code: string;
  coverage: number; // %
  detectedCount: number;
}

const DEFAULT_TACTICS: MitreTactic[] = [
  { id: '1', name: 'Initial Access', code: 'TA0001', coverage: 0, detectedCount: 0 },
  { id: '2', name: 'Execution', code: 'TA0002', coverage: 0, detectedCount: 0 },
  { id: '3', name: 'Persistence', code: 'TA0003', coverage: 0, detectedCount: 0 },
  { id: '4', name: 'Privilege Escalation', code: 'TA0004', coverage: 0, detectedCount: 0 },
  { id: '5', name: 'Defense Evasion', code: 'TA0005', coverage: 0, detectedCount: 0 },
  { id: '6', name: 'Credential Access', code: 'TA0006', coverage: 0, detectedCount: 0 },
  { id: '7', name: 'Discovery', code: 'TA0007', coverage: 0, detectedCount: 0 },
  { id: '8', name: 'Lateral Movement', code: 'TA0008', coverage: 0, detectedCount: 0 },
  { id: '9', name: 'Collection', code: 'TA0009', coverage: 0, detectedCount: 0 },
  { id: '10', name: 'Exfiltration', code: 'TA0010', coverage: 0, detectedCount: 0 },
  { id: '11', name: 'Command & Control', code: 'TA0011', coverage: 0, detectedCount: 0 },
];

const MitreAttackCoverage = ({ lastEvent }: { lastEvent?: any }) => {
  const [tactics, setTactics] = useState<MitreTactic[]>(DEFAULT_TACTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    threatService.getMitre()
      .then((data) => {
        const updated = DEFAULT_TACTICS.map((t) => {
          const match = data.tactics.find((x) => x.tactic.toLowerCase() === t.name.toLowerCase());
          const count = match ? match.count : 0;
          return {
            ...t,
            detectedCount: count,
            coverage: count > 0 ? 100 : 0
          };
        });
        setTactics(updated);
      })
      .catch((err) => {
        setError('Failed to load MITRE data');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lastEvent && lastEvent.mitre && lastEvent.mitre.tactic) {
      setTactics((prev) =>
        prev.map((t) => {
          if (t.name.toLowerCase() === lastEvent.mitre.tactic.toLowerCase()) {
            const newCount = t.detectedCount + 1;
            return {
              ...t,
              detectedCount: newCount,
              coverage: 100
            };
          }
          return t;
        })
      );
    }
  }, [lastEvent]);

  const totalDetections = tactics.reduce((acc, curr) => acc + curr.detectedCount, 0);

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">⚔️</span>
          MITRE ATT&CK® Enterprise Heatmap Coverage
        </div>
        <span className="soc-panel-badge" style={{ color: totalDetections > 0 ? 'var(--status-critical)' : 'var(--text-muted)' }}>
          {totalDetections > 0 ? `${totalDetections} Real Detections` : 'No MITRE activity detected yet.'}
        </span>
      </div>

      <div className="soc-panel-body">
        {loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading MITRE data...</div>}
        {error && <div style={{ padding: 24, textAlign: 'center', color: 'var(--status-critical)' }}>{error}</div>}
        {!loading && !error && (
          <div className="mitre-heatmap-grid">
            {tactics.map((tactic) => {
              const color =
                tactic.detectedCount > 0
                  ? 'var(--status-critical)'
                  : 'var(--status-success)';

              return (
                <div key={tactic.id} className="mitre-cell">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                      {tactic.code}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                      {tactic.detectedCount} evts
                    </span>
                  </div>

                  <div className="mitre-cell-name">{tactic.name}</div>

                  <div className="mitre-cell-value" style={{ color }}>
                    {tactic.detectedCount > 0 ? `${tactic.detectedCount} Detections` : 'Clean'}
                  </div>

                  <div className="mitre-bar">
                    <div className="mitre-fill" style={{ width: tactic.detectedCount > 0 ? '100%' : '0%', background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MitreAttackCoverage;
