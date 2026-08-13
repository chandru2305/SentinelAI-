import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import SOCOverviewCards from '../../components/cards/SOCOverviewCards';
import ThreatTimelineChart from '../../components/charts/ThreatTimelineChart';
import GlobalAttackMap from '../../components/map/GlobalAttackMap';
import LiveThreatFeed from '../../components/dashboard/LiveThreatFeed';
import ActiveIncidents from '../../components/incidents/ActiveIncidents';
import AISecurityAssistant from '../../components/ai/AISecurityAssistant';
import EndpointStatus from '../../components/endpoints/EndpointStatus';
import NetworkActivity from '../../components/network/NetworkActivity';
import RecentAlertsFeed from '../../components/alerts/RecentAlertsFeed';
import MitreAttackCoverage from '../../components/mitre/MitreAttackCoverage';
import ThreatIntelligence from '../../components/intel/ThreatIntelligence';

const DashboardHome = () => {
  const [lastEvent, setLastEvent] = useState<any>(null);
  const { status } = useWebSocket((event) => {
    setLastEvent(event);
  });

  const getStatusColor = () => {
    switch (status) {
      case 'LIVE': return '#10B981';
      case 'CONNECTING':
      case 'RECONNECTING': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Real-time SOC connection status indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <span 
          style={{ 
            display: 'inline-block', 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: getStatusColor(),
            boxShadow: `0 0 6px ${getStatusColor()}`
          }}
        ></span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          SOC CHANNEL: {status}
        </span>
      </div>

      {/* SECTION 1: SOC Overview Cards */}
      <SOCOverviewCards lastEvent={lastEvent} />

      {/* SECTION 2 & 3: Threat Timeline + Global Attack Map */}
      <div className="soc-grid-2col">
        <ThreatTimelineChart />
        <GlobalAttackMap />
      </div>

      {/* SECTION 4: Live Threat Feed Table */}
      <LiveThreatFeed lastEvent={lastEvent} />

      {/* SECTION 5 & 6: Active Incidents + AI Security Assistant */}
      <div className="soc-grid-2col">
        <ActiveIncidents />
        <AISecurityAssistant />
      </div>

      {/* SECTION 7 & 8 & 9: Endpoints + Network + Recent Alerts */}
      <div className="soc-grid-3col">
        <EndpointStatus />
        <NetworkActivity />
        <RecentAlertsFeed lastEvent={lastEvent} />
      </div>

      {/* SECTION 10 & 11: MITRE ATT&CK Coverage + Threat Intelligence */}
      <div className="soc-grid-2col">
        <MitreAttackCoverage lastEvent={lastEvent} />
        <ThreatIntelligence lastEvent={lastEvent} />
      </div>
    </div>
  );
};

export default DashboardHome;
