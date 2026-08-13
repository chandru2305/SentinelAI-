interface EndpointItem {
  id: string;
  name: string;
  ip: string;
  os: string;
  status: 'online' | 'warning' | 'critical' | 'scanning';
  statusText: string;
}

const endpointsData: EndpointItem[] = [
  { id: '1', name: 'US-EAST-DC01', ip: '10.0.1.10', os: 'Windows Server 2022', status: 'online', statusText: 'Online' },
  { id: '2', name: 'PROD-K8S-NODE-04', ip: '10.0.4.88', os: 'Ubuntu 22.04 LTS', status: 'scanning', statusText: 'EDR Scan' },
  { id: '3', name: 'FINANCE-WKS-049', ip: '10.0.12.105', os: 'Windows 11 Enterprise', status: 'critical', statusText: 'Ransomware Blocked' },
  { id: '4', name: 'DB-PRIMARY-PG01', ip: '10.0.2.15', os: 'RHEL 9.2', status: 'online', statusText: 'Online' },
  { id: '5', name: 'AI-INFERENCE-RIG01', ip: '10.0.8.22', os: 'Ubuntu 22.04 LTS', status: 'warning', statusText: 'High CPU (92%)' },
];

const EndpointStatus = () => {
  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">💻</span>
          Endpoint Telemetry & Agent Health
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--status-success)' }}>14,892 Total</strong> Agents
        </div>
      </div>

      <div className="soc-panel-body">
        {/* Status Summary Pills */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 12,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          <span className="soc-panel-badge" style={{ color: 'var(--status-success)', border: '1px solid var(--status-success-border)' }}>
            ● 14,102 Online
          </span>
          <span className="soc-panel-badge" style={{ color: 'var(--primary-blue)', border: '1px solid var(--primary-blue-glow)' }}>
            ● 120 Scanning
          </span>
          <span className="soc-panel-badge" style={{ color: 'var(--status-warning)', border: '1px solid var(--status-warning-border)' }}>
            ● 18 Warning
          </span>
          <span className="soc-panel-badge" style={{ color: 'var(--status-critical)', border: '1px solid var(--status-critical-border)' }}>
            ● 6 Blocked
          </span>
        </div>

        {/* Endpoint List */}
        <div className="endpoint-list">
          {endpointsData.map((ep) => (
            <div key={ep.id} className="endpoint-item">
              <div className="endpoint-name-col">
                <span className={`status-indicator-dot ${ep.status}`} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ep.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {ep.ip} · {ep.os}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color:
                      ep.status === 'online'
                        ? 'var(--status-success)'
                        : ep.status === 'scanning'
                        ? 'var(--primary-blue)'
                        : ep.status === 'warning'
                        ? 'var(--status-warning)'
                        : 'var(--status-critical)',
                  }}
                >
                  {ep.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EndpointStatus;
