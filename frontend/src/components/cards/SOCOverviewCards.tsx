import { useEffect, useState, useRef } from 'react';
import { dashboardService, DashboardSummary } from '../../services/dashboardService';

interface StatCardItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDir: 'up-critical' | 'up-good' | 'down-good' | 'neutral';
  icon: string;
  iconBg: string;
  sparklineColor: string;
  sparklineData: number[];
}

function buildCards(s: DashboardSummary | null): StatCardItem[] {
  if (!s) {
    return [
      { id: 'threats', label: 'Threats Detected', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '🎯', iconBg: 'rgba(239,68,68,0.15)', sparklineColor: '#EF4444', sparklineData: [0] },
      { id: 'alerts', label: 'Critical / High', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '🚨', iconBg: 'rgba(245,158,11,0.15)', sparklineColor: '#F59E0B', sparklineData: [0] },
      { id: 'blocked', label: 'Threats Blocked', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '🛡️', iconBg: 'rgba(16,185,129,0.15)', sparklineColor: '#10B981', sparklineData: [0] },
      { id: 'confidence', label: 'Avg Confidence', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '🤖', iconBg: 'rgba(99,102,241,0.15)', sparklineColor: '#6366F1', sparklineData: [0] },
      { id: 'ai-status', label: 'AI Status', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '⚡', iconBg: 'rgba(59,130,246,0.15)', sparklineColor: '#3B82F6', sparklineData: [0] },
      { id: 'system', label: 'System Health', value: '—', trend: 'Loading...', trendDir: 'neutral', icon: '💚', iconBg: 'rgba(6,182,212,0.15)', sparklineColor: '#06B6D4', sparklineData: [0] },
    ];
  }

  const critHigh = s.critical_threats + s.high_threats;
  const aiOnline = s.ai_status === 'active';

  return [
    {
      id: 'threats',
      label: 'Threats Detected',
      value: s.threats_detected.toLocaleString(),
      trend: `${s.recent_threats} recent`,
      trendDir: s.threats_detected > 0 ? 'up-critical' : 'neutral',
      icon: '🎯',
      iconBg: 'rgba(239,68,68,0.15)',
      sparklineColor: '#EF4444',
      sparklineData: [s.low_threats, s.medium_threats, s.high_threats, s.critical_threats],
    },
    {
      id: 'alerts',
      label: 'Critical / High',
      value: critHigh.toString(),
      trend: `${s.critical_threats} critical · ${s.high_threats} high`,
      trendDir: critHigh > 0 ? 'up-critical' : 'neutral',
      icon: '🚨',
      iconBg: 'rgba(245,158,11,0.15)',
      sparklineColor: '#F59E0B',
      sparklineData: [s.high_threats, s.critical_threats],
    },
    {
      id: 'blocked',
      label: 'Threats Blocked',
      value: s.threats_blocked.toLocaleString(),
      trend: s.threats_detected > 0 ? `${Math.round((s.threats_blocked / s.threats_detected) * 100)}% block rate` : 'No data',
      trendDir: 'up-good',
      icon: '🛡️',
      iconBg: 'rgba(16,185,129,0.15)',
      sparklineColor: '#10B981',
      sparklineData: [s.threats_blocked],
    },
    {
      id: 'confidence',
      label: 'Avg Confidence',
      value: s.average_confidence > 0 ? `${s.average_confidence}%` : '—',
      trend: s.average_confidence >= 90 ? 'High precision' : s.average_confidence > 0 ? 'Moderate' : 'No data',
      trendDir: s.average_confidence >= 90 ? 'up-good' : 'neutral',
      icon: '🤖',
      iconBg: 'rgba(99,102,241,0.15)',
      sparklineColor: '#6366F1',
      sparklineData: [s.average_confidence],
    },
    {
      id: 'ai-status',
      label: 'AI Engine',
      value: aiOnline ? 'Online' : 'Offline',
      trend: aiOnline ? 'Ollama connected' : 'AI unavailable',
      trendDir: aiOnline ? 'up-good' : 'neutral',
      icon: '⚡',
      iconBg: 'rgba(59,130,246,0.15)',
      sparklineColor: '#3B82F6',
      sparklineData: [aiOnline ? 100 : 0],
    },
    {
      id: 'system',
      label: 'System Health',
      value: `${s.system_health}%`,
      trend: 'Backend operational',
      trendDir: 'up-good',
      icon: '💚',
      iconBg: 'rgba(6,182,212,0.15)',
      sparklineColor: '#06B6D4',
      sparklineData: [s.system_health],
    },
  ];
}

// Helper to render an inline SVG sparkline path
const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) {
    // Single value: render a flat line
    return (
      <svg className="soc-sparkline-wrapper" viewBox="0 0 120 28" preserveAspectRatio="none">
        <line x1="0" y1="14" x2="120" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const height = 28;
  const width = 120;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="soc-sparkline-wrapper" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const SOCOverviewCards = ({ lastEvent }: { lastEvent?: any }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const seenEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    dashboardService.getSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    if (lastEvent && summary) {
      if (seenEventsRef.current.has(lastEvent.id)) {
        return;
      }
      seenEventsRef.current.add(lastEvent.id);

      setSummary((prev) => {
        if (!prev) return null;

        const isCritical = lastEvent.severity === 'critical';
        const isHigh = lastEvent.severity === 'high';
        const isMedium = lastEvent.severity === 'medium';
        const isLow = lastEvent.severity === 'low';
        const isThreat = isCritical || isHigh || isMedium || isLow;

        return {
          ...prev,
          threats_detected: prev.threats_detected + 1,
          threats_blocked: prev.threats_blocked + (isThreat ? 1 : 0),
          critical_threats: prev.critical_threats + (isCritical ? 1 : 0),
          high_threats: prev.high_threats + (isHigh ? 1 : 0),
          medium_threats: prev.medium_threats + (isMedium ? 1 : 0),
          low_threats: prev.low_threats + (isLow ? 1 : 0),
          recent_threats: prev.recent_threats + 1,
        };
      });
    }
  }, [lastEvent, summary]);

  const cards = buildCards(summary);

  return (
    <div className="soc-overview-grid">
      {cards.map((card) => (
        <div key={card.id} className="soc-stat-card">
          <div className="soc-stat-header">
            <span className="soc-stat-label">{card.label}</span>
            <div className="soc-stat-icon-wrapper" style={{ background: card.iconBg }}>
              {card.icon}
            </div>
          </div>

          <div className="soc-stat-value-container">
            <div className="soc-stat-value">{card.value}</div>
            <div className={`soc-stat-trend ${card.trendDir}`}>
              {card.trendDir.includes('up') ? '↑' : card.trendDir.includes('down') ? '↓' : '•'} {card.trend}
            </div>
          </div>

          <MiniSparkline data={card.sparklineData} color={card.sparklineColor} />
        </div>
      ))}
    </div>
  );
};

export default SOCOverviewCards;
