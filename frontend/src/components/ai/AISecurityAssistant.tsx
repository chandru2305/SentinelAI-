import { useState } from 'react';

const AISecurityAssistant = () => {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: 'SentinelAI Intelligence Active. Identified 1 critical prompt injection vector matching CVE-2024-4192. Recommended action: Revoke API key token & block source IP 185.220.101.45.',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setChatLog((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');

    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Analyzing query: "${userText}". No additional MITRE ATT&CK techniques matched in past 1000 telemetry events. Endpoints operating normally.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🤖</span>
          AI Security Co-Pilot & Autonomous Analysis
        </div>
        <div className="attack-live-indicator" style={{ borderColor: 'rgba(99, 102, 241, 0.3)', color: '#818CF8' }}>
          <span className="attack-ping-dot" style={{ background: '#818CF8', boxShadow: '0 0 8px #818CF8' }}></span>
          OLLAMA ACTIVE
        </div>
      </div>

      <div className="soc-panel-body">
        {/* Model Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat( auto-fit, minmax(110px, 1fr) )',
            gap: 10,
            background: 'var(--bg-dark)',
            padding: 12,
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>MODEL</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)' }}>LLaMA 3.1 8B</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>CONFIDENCE</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>94.7%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>LAST SCAN</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>2m ago</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>LATENCY</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-blue)', fontFamily: 'var(--font-mono)' }}>143 ms</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>TOKENS USED</div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>1.42 M</div>
          </div>
        </div>

        {/* AI Recommendation Alert */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '3px solid var(--primary-blue)',
            padding: '10px 12px',
            borderRadius: '0 6px 6px 0',
            marginBottom: 14,
            fontSize: '0.8rem',
          }}
        >
          <strong style={{ color: 'var(--primary-blue)' }}>Autonomous AI Recommendation:</strong> Apply firewall rule to isolate subnet <code style={{ background: 'var(--bg-dark)', padding: '1px 5px', borderRadius: 4 }}>185.220.101.0/24</code> and initiate deep memory dump on Host-049.
        </div>

        {/* Mini Chat Feed */}
        <div
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: 6,
            padding: 10,
            maxHeight: 130,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {chatLog.map((msg, i) => (
            <div key={i} style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: msg.role === 'ai' ? '#818CF8' : 'var(--text-main)',
                  marginRight: 6,
                }}
              >
                {msg.role === 'ai' ? '🤖 SentinelAI:' : '👤 Analyst:'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Interactive Chat Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="topbar-search-input"
            style={{ paddingLeft: 12 }}
            placeholder="Ask AI Assistant to analyze IOCs, log traces, or generate playbooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-soc-primary">
            Ask AI
          </button>
        </form>
      </div>
    </div>
  );
};

export default AISecurityAssistant;
