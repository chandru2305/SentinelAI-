import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const networkTrafficData = [
  { time: '00:00', inbound: 4.2, outbound: 2.1, blocked: 120 },
  { time: '04:00', inbound: 3.1, outbound: 1.5, blocked: 85 },
  { time: '08:00', inbound: 8.9, outbound: 4.6, blocked: 420 },
  { time: '12:00', inbound: 12.4, outbound: 7.2, blocked: 890 },
  { time: '16:00', inbound: 10.1, outbound: 5.8, blocked: 610 },
  { time: '20:00', inbound: 6.5, outbound: 3.4, blocked: 310 },
];

const NetworkActivity = () => {
  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🌐</span>
          Network Gateway & Traffic Telemetry
        </div>
        <span className="soc-panel-badge" style={{ color: 'var(--accent-cyan)' }}>
          12.4 Gbps Peak
        </span>
      </div>

      <div className="soc-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Inbound / Outbound Area Chart */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            INBOUND VS OUTBOUND BANDWIDTH (Gbps)
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={networkTrafficData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#263247" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#121826',
                  border: '1px solid #263247',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#F8FAFC',
                }}
              />
              <Area type="monotone" dataKey="inbound" stroke="#3B82F6" strokeWidth={2} fill="url(#inboundGrad)" name="Inbound (Gbps)" />
              <Area type="monotone" dataKey="outbound" stroke="#06B6D4" strokeWidth={2} fill="url(#outboundGrad)" name="Outbound (Gbps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Blocked Connections Bar Chart */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            SUPPRESSED ROGUE CONNECTION ATTEMPTS (per hr)
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={networkTrafficData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#263247" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#121826',
                  border: '1px solid #263247',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="blocked" fill="#EF4444" radius={[3, 3, 0, 0]} name="Blocked Conns" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NetworkActivity;
