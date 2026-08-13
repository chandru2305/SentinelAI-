import { useState, useEffect } from 'react';

interface AttackVector {
  id: string;
  source: string;
  sourceCoords: [number, number]; // [x %, y %]
  target: string;
  targetCoords: [number, number];
  threat: string;
  severity: 'critical' | 'high' | 'medium';
  ip: string;
}

const mockAttacks: AttackVector[] = [
  { id: '1', source: 'Russia (RU)', sourceCoords: [68, 28], target: 'USA (US-East)', targetCoords: [24, 38], threat: 'APT29 / Ransomware Payload', severity: 'critical', ip: '185.220.101.45' },
  { id: '2', source: 'China (CN)', sourceCoords: [78, 42], target: 'Germany (EU-Central)', targetCoords: [51, 32], threat: 'Zero-Day Exploit Attempt', severity: 'critical', ip: '103.21.73.12' },
  { id: '3', source: 'North Korea (KP)', sourceCoords: [82, 38], target: 'Japan (AP-East)', targetCoords: [84, 40], threat: 'Lazarus Spear-Phishing', severity: 'high', ip: '175.45.176.80' },
  { id: '4', source: 'Brazil (BR)', sourceCoords: [35, 70], target: 'UK (EU-West)', targetCoords: [47, 28], threat: 'Botnet Credential Stuffing', severity: 'medium', ip: '186.202.153.8' },
  { id: '5', source: 'Iran (IR)', sourceCoords: [62, 44], target: 'Singapore (SG)', targetCoords: [76, 58], threat: 'DDoS Amplification Vector', severity: 'high', ip: '5.160.22.4' },
];

const GlobalAttackMap = () => {
  const [activeAttackIndex, setActiveAttackIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAttackIndex((prev) => (prev + 1) % mockAttacks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentAttack = mockAttacks[activeAttackIndex];

  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🌍</span>
          Global Attack Vectors & Geolocation Map
        </div>
        <div className="attack-live-indicator">
          <span className="attack-ping-dot"></span>
          REAL-TIME TELEMETRY
        </div>
      </div>

      <div className="soc-panel-body" style={{ padding: 0 }}>
        <div className="attack-map-container">
          {/* Overlay info box */}
          <div className="attack-map-overlay">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Active Incident: <span style={{ color: 'var(--status-critical)' }}>{currentAttack.threat}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              From: <strong style={{ color: 'var(--text-main)' }}>{currentAttack.source}</strong> ({currentAttack.ip}) → To: <strong style={{ color: 'var(--text-main)' }}>{currentAttack.target}</strong>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg width="100%" height="100%" viewBox="0 0 1000 500" style={{ background: '#080D1A' }}>
            {/* World Continents Wireframe Outlines */}
            <g stroke="#1F2C42" strokeWidth="1" fill="#0E1626" opacity="0.9">
              {/* North America */}
              <path d="M 120 100 L 280 90 L 320 180 L 260 260 L 220 250 L 150 200 L 90 140 Z" />
              {/* South America */}
              <path d="M 280 270 L 340 280 L 370 380 L 320 460 L 270 380 Z" />
              {/* Europe */}
              <path d="M 450 100 L 580 90 L 590 180 L 480 190 L 440 140 Z" />
              {/* Africa */}
              <path d="M 460 210 L 590 200 L 610 320 L 540 420 L 480 340 Z" />
              {/* Asia */}
              <path d="M 600 80 L 880 70 L 920 220 L 780 280 L 620 200 Z" />
              {/* Australia */}
              <path d="M 780 340 L 900 330 L 910 420 L 800 420 Z" />
            </g>

            {/* Grid Lines */}
            <g stroke="#162235" strokeWidth="0.5" strokeDasharray="4 4">
              <line x1="0" y1="125" x2="1000" y2="125" />
              <line x1="0" y1="250" x2="1000" y2="250" />
              <line x1="0" y1="375" x2="1000" y2="375" />
              <line x1="250" y1="0" x2="250" y2="500" />
              <line x1="500" y1="0" x2="500" y2="500" />
              <line x1="750" y1="0" x2="750" y2="500" />
            </g>

            {/* Attack Arcs & Markers */}
            {mockAttacks.map((attack, idx) => {
              const startX = (attack.sourceCoords[0] / 100) * 1000;
              const startY = (attack.sourceCoords[1] / 100) * 500;
              const endX = (attack.targetCoords[0] / 100) * 1000;
              const endY = (attack.targetCoords[1] / 100) * 500;

              const isCurrent = idx === activeAttackIndex;
              const midX = (startX + endX) / 2;
              const midY = Math.min(startY, endY) - 50;

              const color = attack.severity === 'critical' ? '#EF4444' : attack.severity === 'high' ? '#F59E0B' : '#3B82F6';

              return (
                <g key={attack.id}>
                  {/* Quadratic Arc Path */}
                  <path
                    d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isCurrent ? '2.5' : '1'}
                    opacity={isCurrent ? 1 : 0.25}
                    strokeDasharray={isCurrent ? 'none' : '4 4'}
                  />

                  {/* Source Circle */}
                  <circle cx={startX} cy={startY} r={isCurrent ? 6 : 4} fill={color} opacity={isCurrent ? 1 : 0.4} />
                  {/* Target Pulse Marker */}
                  <circle cx={endX} cy={endY} r={isCurrent ? 8 : 4} fill={color} opacity={isCurrent ? 0.9 : 0.4}>
                    {isCurrent && <animate attributeName="r" values="4;14;4" dur="1.5s" repeatCount="indefinite" />}
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Stats Overlay Bottom Right */}
          <div className="attack-stats-overlay">
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Source IPs: </span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>1,492 active</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Top Origin: </span>
              <strong style={{ color: 'var(--status-critical)', fontFamily: 'var(--font-mono)' }}>RU / CN / KP</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAttackMap;
