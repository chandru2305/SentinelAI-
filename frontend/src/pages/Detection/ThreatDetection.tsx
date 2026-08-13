import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { threatService, ThreatAnalysisRequest, ThreatAnalysisResponse } from '../../services/threatService';

const inputModes = ['text', 'logs', 'url', 'headers', 'body'] as const;

type InputMode = (typeof inputModes)[number];

const ThreatDetection = () => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [logs, setLogs] = useState('');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<ThreatAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPayload = useMemo<ThreatAnalysisRequest>(() => ({
    text: inputMode === 'text' ? text : undefined,
    logs: inputMode === 'logs' ? logs : undefined,
    url: inputMode === 'url' ? url : undefined,
    headers: inputMode === 'headers' ? JSON.parse(headers || '{}') : undefined,
    body: inputMode === 'body' ? body : undefined,
  }), [inputMode, text, logs, url, headers, body]);

  const onAnalyze = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await threatService.analyze(requestPayload);
      setResult(response);
    } catch (err) {
      setError((err as Error).message || 'Threat analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    switch (inputMode) {
      case 'logs':
        return (
          <textarea
            className="form-textarea"
            rows={10}
            placeholder="Paste raw log data here..."
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
          />
        );
      case 'url':
        return (
          <input
            className="form-input"
            placeholder="Enter a suspicious URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        );
      case 'headers':
        return (
          <textarea
            className="form-textarea"
            rows={8}
            placeholder='Paste HTTP headers as JSON, e.g. {"User-Agent":"curl/7.88.1"}'
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
        );
      case 'body':
        return (
          <textarea
            className="form-textarea"
            rows={10}
            placeholder="Paste HTTP request body or payload here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        );
      default:
        return (
          <textarea
            className="form-textarea"
            rows={10}
            placeholder="Paste suspicious text to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="Threat Detection" />

      <div className="section-grid-2col">
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Input Panel</div>
          </div>
          <div className="section-card-body">
            <div className="tab-row">
              {inputModes.map((mode) => (
                <button
                  key={mode}
                  className={`tab-button${inputMode === mode ? ' active' : ''}`}
                  onClick={() => setInputMode(mode)}
                  type="button"
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="form-group">{renderInput()}</div>
            <div className="form-actions">
              <button className="action-btn primary" onClick={onAnalyze} disabled={loading}>
                {loading ? 'Analyzing...' : 'Run Detection'}
              </button>
              <button className="action-btn" onClick={() => setResult(null)} disabled={loading}>
                Reset
              </button>
            </div>
            {error && <div className="status-message error">{error}</div>}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">Detection Results</div>
          </div>
          <div className="section-card-body">
            {!result && <div className="status-message info">Run a detection scan to see results.</div>}
            {result && (
              <>
                <div className="risk-summary-row">
                  <div className="risk-meter">
                    <div className="risk-meter-label">Risk Score</div>
                    <div className="risk-meter-value">{result.risk_score}</div>
                    <div className="risk-meter-bar">
                      <div className="risk-meter-fill" style={{ width: `${result.risk_score}%` }} />
                    </div>
                  </div>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div>Severity</div>
                      <strong>{result.highest_severity.toUpperCase()}</strong>
                    </div>
                    <div className="summary-card">
                      <div>Confidence</div>
                      <strong>{result.confidence}%</strong>
                    </div>
                    <div className="summary-card">
                      <div>Priority</div>
                      <strong>{result.priority}</strong>
                    </div>
                  </div>
                </div>
                <div className="threat-card-grid">
                  {result.threats.map((threat) => (
                    <div className="threat-card" key={threat.rule_name}>
                      <div className="threat-card-header">
                        <div>
                          <h3>{threat.rule_name}</h3>
                          <span className={`badge ${threat.severity}`}>{threat.severity.toUpperCase()}</span>
                        </div>
                        <span className="rule-tag">{threat.category}</span>
                      </div>
                      <p>{threat.details}</p>
                      <div className="indicator-list">
                        {threat.indicators.map((indicator) => (
                          <div key={indicator.value} className="indicator-pill">
                            <strong>{indicator.type}</strong>: {indicator.value}
                          </div>
                        ))}
                      </div>
                      <div className="threat-card-footer">
                        <div>
                          <strong>MITRE</strong> {threat.mitre.technique_id}
                        </div>
                        <div>{threat.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection;
