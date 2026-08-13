import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ===================== THREATS PER DAY =====================
const threatsPerDayData = [
  { day: 'Mon', threats: 24, blocked: 22 },
  { day: 'Tue', threats: 38, blocked: 35 },
  { day: 'Wed', threats: 31, blocked: 28 },
  { day: 'Thu', threats: 52, blocked: 49 },
  { day: 'Fri', threats: 43, blocked: 41 },
  { day: 'Sat', threats: 17, blocked: 16 },
  { day: 'Sun', threats: 12, blocked: 11 },
];

export const ThreatsPerDayChart = () => (
  <div className="chart-wrapper">
    <div className="chart-header">
      <div>
        <div className="chart-title">
          <span className="chart-title-icon">📈</span>
          Threats Per Day
        </div>
        <div className="chart-subtitle">Last 7 days</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={threatsPerDayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(99,179,237,0.06)" strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fill: '#4d6a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4d6a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: '#111d2e',
            border: '1px solid rgba(99,179,237,0.14)',
            borderRadius: 8,
            fontSize: 12,
            color: '#e2ecff',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8ba8cc' }} />
        <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fill="url(#threatGrad)" name="Threats" />
        <Area type="monotone" dataKey="blocked" stroke="#22c55e" strokeWidth={2} fill="url(#blockedGrad)" name="Blocked" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ===================== SEVERITY DISTRIBUTION =====================
const severityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 45, color: '#eab308' },
  { name: 'Low', value: 63, color: '#22c55e' },
];

export const SeverityDistributionChart = () => (
  <div className="chart-wrapper">
    <div className="chart-header">
      <div>
        <div className="chart-title">
          <span className="chart-title-icon">🎯</span>
          Severity Distribution
        </div>
        <div className="chart-subtitle">Current period</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={severityData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {severityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#111d2e',
            border: '1px solid rgba(99,179,237,0.14)',
            borderRadius: 8,
            fontSize: 12,
            color: '#e2ecff',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#8ba8cc' }}
          formatter={(value) => <span style={{ color: '#8ba8cc' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// ===================== CPU USAGE =====================
const cpuData = [
  { time: '00:00', cpu: 32 },
  { time: '04:00', cpu: 18 },
  { time: '08:00', cpu: 65 },
  { time: '10:00', cpu: 78 },
  { time: '12:00', cpu: 54 },
  { time: '14:00', cpu: 87 },
  { time: '16:00', cpu: 72 },
  { time: '18:00', cpu: 61 },
  { time: '20:00', cpu: 43 },
  { time: '22:00', cpu: 38 },
];

export const CpuUsageChart = () => (
  <div className="chart-wrapper">
    <div className="chart-header">
      <div>
        <div className="chart-title">
          <span className="chart-title-icon">💻</span>
          CPU Usage
        </div>
        <div className="chart-subtitle">Today's trend (%)</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={cpuData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(99,179,237,0.06)" strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fill: '#4d6a8a', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#4d6a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: '#111d2e',
            border: '1px solid rgba(99,179,237,0.14)',
            borderRadius: 8,
            fontSize: 12,
            color: '#e2ecff',
          }}
          formatter={(val: any) => [`${val}%`, 'CPU']}
        />
        <Area type="monotone" dataKey="cpu" stroke="#f97316" strokeWidth={2} fill="url(#cpuGrad)" name="CPU %" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ===================== MEMORY USAGE =====================
const memData = [
  { time: '00:00', memory: 52 },
  { time: '04:00', memory: 48 },
  { time: '08:00', memory: 61 },
  { time: '10:00', memory: 73 },
  { time: '12:00', memory: 69 },
  { time: '14:00', memory: 81 },
  { time: '16:00', memory: 75 },
  { time: '18:00', memory: 68 },
  { time: '20:00', memory: 58 },
  { time: '22:00', memory: 55 },
];

export const MemoryUsageChart = () => (
  <div className="chart-wrapper">
    <div className="chart-header">
      <div>
        <div className="chart-title">
          <span className="chart-title-icon">🧠</span>
          Memory Usage
        </div>
        <div className="chart-subtitle">Today's trend (%)</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={memData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(99,179,237,0.06)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: '#4d6a8a', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#4d6a8a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: '#111d2e',
            border: '1px solid rgba(99,179,237,0.14)',
            borderRadius: 8,
            fontSize: 12,
            color: '#e2ecff',
          }}
          formatter={(val: any) => [`${val}%`, 'Memory']}
        />
        <Bar dataKey="memory" radius={[3, 3, 0, 0]} fill="#06b6d4" fillOpacity={0.8} name="Memory %" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
