import { useEffect, useState } from 'react';
import { aiService, AIStatusResponse } from '../../services/aiService';

const AIStatusPanel = () => {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await aiService.status();
        setStatus(response);
      } catch (err) {
        setError((err as Error).message || 'Unable to load AI status');
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-card-title-icon">🤖</span>
          AI Engine Status
        </div>
        <span className={`page-header-badge ${status?.ollama_running ? 'live' : 'offline'}`}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {status?.ollama_running ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      <div className="section-card-body">
        {loading && <div className="status-message info">Loading AI status...</div>}
        {error && <div className="status-message error">{error}</div>}
        {!loading && !error && status && (
          <div className="ai-status-grid">
            <div className="ai-status-row">
              <div className="ai-status-label">Ollama Status</div>
              <div className="ai-status-value">{status.ollama_running ? 'Running' : 'Offline'}</div>
            </div>
            <div className="ai-status-row">
              <div className="ai-status-label">Model Loaded</div>
              <div className="ai-status-value">{status.model}</div>
            </div>
            <div className="ai-status-row">
              <div className="ai-status-label">Latency</div>
              <div className="ai-status-value">{status.latency_ms.toFixed(0)} ms</div>
            </div>
            <div className="ai-status-row">
              <div className="ai-status-label">Version</div>
              <div className="ai-status-value">{status.version}</div>
            </div>
            <div className="ai-status-row">
              <div className="ai-status-label">VRAM Usage</div>
              <div className="ai-status-value">{status.vram_usage ?? 'N/A'}</div>
            </div>
            <div className="ai-status-row">
              <div className="ai-status-label">RAM Usage</div>
              <div className="ai-status-value">{status.ram_usage ?? 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStatusPanel;
