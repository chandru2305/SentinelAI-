import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { aiService, AISecurityAnalysis } from '../../services/aiService';

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
  UNKNOWN: '',
};

const ThreatAnalyzer = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<AISecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOffline, setAiOffline] = useState(false);

  const canAnalyze = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const onAnalyze = async () => {
    setError(null);
    setAiOffline(false);
    setLoading(true);
    try {
      const response = await aiService.analyzeSecurityEvent({
        input: input.trim(),
        context: context.trim() || undefined,
      });
      if (response.success && response.analysis) {
        setResult(response.analysis);
        // Detect offline fallback
        if (response.analysis.explanation?.includes('offline') || response.analysis.explanation?.includes('unavailable')) {
          setAiOffline(true);
        }
      } else {
        setError(response.error || 'Analysis failed.');
      }
    } catch (err) {
      setError((err as Error).message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const confidencePct = result ? Math.round(result.confidence * 100) : 0;
  const severityClass = result ? (SEVERITY_BADGE[result.severity] || '') : '';

  return (
    <div className="page-shell">
      <PageHeader title="Threat Analyzer" />

      {/* Input Panel */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">AI Threat Detection</div>
          {aiOffline && (
            <span className="page-header-badge offline">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              AI OFFLINE
            </span>
          )}
        </div>
        <div className="section-card-body">
          <p className="section-card-description">
            Paste suspicious text, logs, or payloads for AI-powered structured threat analysis.
          </p>
          <textarea
            className="form-textarea"
            placeholder="Enter text, logs, URL, or payload to analyze..."
            value={input}
            rows={10}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="form-group" style={{ marginTop: 8 }}>
            <input
              className="form-input"
              placeholder="Context hint (optional, e.g. web request, log file, email)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="action-btn primary" onClick={onAnalyze} disabled={!canAnalyze}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            <button className="action-btn" onClick={() => { setInput(''); setResult(null); setError(null); }} disabled={loading}>
              Clear
            </button>
          </div>
          {error && <div className="status-message error">{error}</div>}
          {aiOffline && (
            <div className="status-message info">
              ⚠️ Ollama is offline. Start Ollama and load a model to enable AI analysis. Rule-based detection is still active.
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Analysis Results</div>
            <span className={`badge ${severityClass}`}>{result.severity}</span>
          </div>
          <div className="section-card-body">

            {/* Summary row */}
            <div className="analysis-grid">
              <div className="analysis-card">
                <div className="analysis-card-label">Threat Type</div>
                <div className="analysis-card-value">{result.threat_type}</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-card-label">Severity</div>
                <div className="analysis-card-value">
                  <span className={`badge ${severityClass}`}>{result.severity}</span>
                </div>
              </div>
              <div className="analysis-card">
                <div className="analysis-card-label">Confidence</div>
                <div className="analysis-card-value">{confidencePct}%</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-card-label">MITRE Tactic</div>
                <div className="analysis-card-value">{result.mitre_tactic || '—'}</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-card-label">MITRE Technique</div>
                <div className="analysis-card-value">{result.mitre_technique || '—'}</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="risk-meter" style={{ marginTop: 12 }}>
              <div className="risk-meter-label">Confidence</div>
              <div className="risk-meter-bar">
                <div className="risk-meter-fill" style={{ width: `${confidencePct}%` }} />
              </div>
            </div>

            {/* Explanation */}
            <div className="analysis-output">
              <div className="analysis-output-block">
                <div className="analysis-output-header">Explanation</div>
                <p>{result.explanation || 'No explanation provided.'}</p>
              </div>
            </div>

            {/* Indicators */}
            {result.indicators.length > 0 && (
              <div className="analysis-output-block" style={{ marginTop: 12 }}>
                <div className="analysis-output-header">Indicators</div>
                <div className="indicator-list">
                  {result.indicators.map((ind, i) => (
                    <div key={i} className="indicator-pill">
                      <strong>IOC</strong>: {ind}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {result.recommended_actions.length > 0 && (
              <div className="analysis-output-block" style={{ marginTop: 12 }}>
                <div className="analysis-output-header">Recommended Actions</div>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {result.recommended_actions.map((action, i) => (
                    <li key={i} style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatAnalyzer;
