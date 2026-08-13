import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { threatService, ThreatHistoryItem } from '../../services/threatService';

const ThreatHistory = () => {
  const [history, setHistory] = useState<ThreatHistoryItem[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    threatService.getHistory(50).then(setHistory).catch(console.error);
  }, []);

  const filtered = history.filter((item) =>
    item.rule_name?.toLowerCase().includes(filter.toLowerCase()) ||
    item.category.toLowerCase().includes(filter.toLowerCase()) ||
    item.severity.toLowerCase().includes(filter.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page-shell">
      <PageHeader title="Threat History" />

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">Recent Detections</div>
        </div>
        <div className="section-card-body">
          <div className="table-tools-row">
            <input
              className="form-input"
              placeholder="Search history..."
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="table-scroll-wrapper">
            <table className="threat-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Threat</th>
                  <th>Severity</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>{item.rule_name}</td>
                    <td><span className={`badge ${item.severity}`}>{item.severity}</span></td>
                    <td>{item.risk_score}</td>
                    <td>{item.status}</td>
                    <td><button className="action-btn">Review</button></td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty-cell">No detections found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-row">
            <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatHistory;
