interface StatCardProps {
  variant: 'threats' | 'blocked' | 'health' | 'ai' | 'cpu' | 'memory';
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: string; direction: 'up' | 'down' };
  footer?: string;
  progress?: number; // 0-100
}

const StatCard = ({ variant, label, value, icon, trend, footer, progress }: StatCardProps) => {
  return (
    <div className={`stat-card ${variant} animate-fadein-up`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>

      <div className="stat-card-value">{value}</div>

      {progress !== undefined && (
        <div className="stat-progress">
          <div
            className="stat-progress-bar"
            style={{
              width: `${progress}%`,
              background:
                variant === 'threats'
                  ? 'var(--status-critical)'
                  : variant === 'blocked'
                  ? 'var(--status-low)'
                  : variant === 'health'
                  ? 'var(--accent-primary)'
                  : variant === 'ai'
                  ? '#a78bfa'
                  : variant === 'cpu'
                  ? 'var(--status-high)'
                  : 'var(--accent-secondary)',
            }}
          />
        </div>
      )}

      <div className="stat-card-footer">
        {trend && (
          <span className={`stat-card-trend ${trend.direction}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {footer && <span>{footer}</span>}
      </div>
    </div>
  );
};

export default StatCard;
