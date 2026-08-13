import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const timelineData24h = [
  { time: '00:00', detected: 42, blocked: 40, resolved: 38 },
  { time: '03:00', detected: 28, blocked: 27, resolved: 26 },
  { time: '06:00', detected: 65, blocked: 62, resolved: 60 },
  { time: '09:00', detected: 110, blocked: 104, resolved: 98 },
  { time: '12:00', detected: 145, blocked: 140, resolved: 135 },
  { time: '15:00', detected: 180, blocked: 172, resolved: 165 },
  { time: '18:00', detected: 130, blocked: 126, resolved: 120 },
  { time: '21:00', detected: 85, blocked: 82, resolved: 80 },
];

const ThreatTimelineChart = () => {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">📈</span>
          Threat Velocity & Mitigation Timeline
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              className="soc-panel-badge"
              style={{
                background: range === r ? 'var(--primary-blue)' : 'var(--bg-dark)',
                color: range === r ? '#FFF' : 'var(--text-muted)',
                borderColor: range === r ? 'var(--primary-blue)' : 'var(--border-color)',
                cursor: 'pointer',
              }}
              onClick={() => setRange(r)}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="soc-panel-body" style={{ padding: '14px 18px 8px 0' }}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={timelineData24h} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="detectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263247" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#121826',
                border: '1px solid #263247',
                borderRadius: 6,
                fontSize: 12,
                color: '#F8FAFC',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6, color: '#94A3B8' }} />
            <Area type="monotone" dataKey="detected" stroke="#EF4444" strokeWidth={2} fill="url(#detectedGrad)" name="Detected" />
            <Area type="monotone" dataKey="blocked" stroke="#10B981" strokeWidth={2} fill="url(#blockedGrad)" name="Blocked" />
            <Area type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={2} fill="url(#resolvedGrad)" name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatTimelineChart;
