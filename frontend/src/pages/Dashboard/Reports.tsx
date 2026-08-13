const reports: any[] = []; // No backend endpoint exists for reports yet

const Reports = () => {
  return (
    <div className="page-shell animate-fadein">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reports</h1>
          <p className="page-header-subtitle">Security reports and compliance documents</p>
        </div>
        <button className="action-btn primary" disabled>Generate Report</button>
      </div>

      <div className="stats-grid responsive-grid">
        <div className="stat-card health">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Reports</span>
            <div className="stat-card-icon">📁</div>
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-footer">This month</div>
        </div>
        <div className="stat-card ai">
          <div className="stat-card-header">
            <span className="stat-card-label">Scheduled</span>
            <div className="stat-card-icon">🗓️</div>
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-footer">Upcoming reports</div>
        </div>
        <div className="stat-card blocked">
          <div className="stat-card-header">
            <span className="stat-card-label">Compliance</span>
            <div className="stat-card-icon">✅</div>
          </div>
          <div className="stat-card-value">—</div>
          <div className="stat-card-footer">SOC 2 compliant</div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-card-title-icon">📄</span>
            Available Reports
          </div>
        </div>
        <div className="section-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No reports available. Report generation is not yet configured.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-icon">{report.icon}</div>
                <div className="report-info">
                  <div className="report-title">{report.title}</div>
                  <div className="report-meta">
                    {report.type} · {report.size} · Generated {report.date}
                  </div>
                </div>
                <span className="badge info">{report.type}</span>
                <span className="report-download">⬇️</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
