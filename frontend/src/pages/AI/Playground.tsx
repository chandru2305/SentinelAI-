import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { aiService } from '../../services/aiService';

interface ChatEntry {
  role: 'user' | 'assistant';
  message: string;
}

const Playground = () => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

  const sendPrompt = async () => {
    setError(null);
    const userMessage = prompt.trim();
    if (!userMessage) return;

    setLoading(true);
    setHistory((current) => [...current, { role: 'user', message: userMessage }]);
    setPrompt('');

    try {
      const response = await aiService.analyze(userMessage);
      setHistory((current) => [
        ...current,
        { role: 'assistant', message: `Risk: ${response.risk}\nConfidence: ${response.confidence}%\nAttack: ${response.attack_type}\nReason: ${response.reason}\nRecommendation: ${response.recommendation}` },
      ]);
    } catch (err) {
      setError((err as Error).message || 'Chat request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="AI Playground" />

      <div className="section-card">
        <div className="section-card-body">
          <div className="playground-grid">
            <div className="playground-panel">
              <label className="form-label" htmlFor="playground-prompt">
                User Prompt
              </label>
              <textarea
                id="playground-prompt"
                className="form-textarea"
                rows={8}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Write a request or sample threat text here..."
              />
              <div className="form-actions">
                <button className="action-btn primary" onClick={sendPrompt} disabled={!canSend}>
                  {loading ? 'Sending...' : 'Send'}
                </button>
                <button className="action-btn" onClick={() => setHistory([])} disabled={loading}>
                  Clear History
                </button>
              </div>
              {error && <div className="status-message error">{error}</div>}
            </div>

            <div className="playground-panel">
              <div className="playground-history-header">History</div>
              <div className="playground-history">
                {history.length === 0 ? (
                  <div className="status-message info">No chat history yet.</div>
                ) : (
                  history.map((entry, index) => (
                    <div key={`${entry.role}-${index}`} className={`chat-entry ${entry.role}`}>
                      <div className="chat-entry-role">{entry.role === 'user' ? 'User' : 'AI'}</div>
                      <pre className="chat-entry-message">{entry.message}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
