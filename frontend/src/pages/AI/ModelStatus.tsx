import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { aiService, AIStatusResponse } from '../../services/aiService';

const ModelStatus = () => {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await aiService.status();
        setStatus(response);
      } catch {
        // If the API itself fails (network error), create a synthetic offline response
        setStatus({
          available: false,
          status: 'error',
          provider: 'ollama',
          ollama_running: false,
          model: 'unknown',
          latency_ms: 0,
          version: 'unknown',
          message: 'Cannot reach backend API.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const isOnline = status?.available ?? false;

  return (
    <div className="page-shell">
      <PageHeader title="Model Status" />

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-card-title-icon">🤖</span>
            AI Engine Status
          </div>
          <span className={`page-header-badge ${isOnline ? 'live' : 'offline'}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="section-card-body">
          {loading && <div className="status-message info">Loading AI model status...</div>}

          {!loading && status && !isOnline && (
            <div className="status-message error" style={{ marginBottom: 16 }}>
              <strong>AI Engine Offline</strong>
              {status.message && <span style={{ marginLeft: 8 }}>— {status.message}</span>}
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
                Start Ollama and load the configured model (<code>{status.model}</code>) to enable AI features.
                Rule-based threat detection remains fully active.
              </p>
            </div>
          )}

          {!loading && status && (
            <div className="status-grid">
              <div className="status-card">
                <div className="status-card-label">Provider</div>
                <div className="status-card-value">{status.provider}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Status</div>
                <div className="status-card-value" style={{ color: isOnline ? 'var(--success)' : 'var(--danger)' }}>
                  {status.status.toUpperCase()}
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Current Model</div>
                <div className="status-card-value">{status.model}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Ollama Running</div>
                <div className="status-card-value">{status.ollama_running ? 'Yes' : 'No'}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Latency</div>
                <div className="status-card-value">
                  {isOnline ? `${status.latency_ms.toFixed(0)} ms` : 'N/A'}
                </div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Version</div>
                <div className="status-card-value">{status.version}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">VRAM Usage</div>
                <div className="status-card-value">{status.vram_usage ?? 'N/A'}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">RAM Usage</div>
                <div className="status-card-value">{status.ram_usage ?? 'N/A'}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Tokens / sec</div>
                <div className="status-card-value">{status.tokens_per_sec ?? 'N/A'}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Context Size</div>
                <div className="status-card-value">{status.context_size ?? 'N/A'}</div>
              </div>
              <div className="status-card">
                <div className="status-card-label">Temperature</div>
                <div className="status-card-value">{status.temperature ?? 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelStatus;
