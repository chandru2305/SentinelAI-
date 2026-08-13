import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'SOC Overview Dashboard',
  '/threat-monitor': 'Threat Monitor Telemetry',
  '/incidents': 'Active Security Incidents',
  '/ai-analysis': 'AI Security Analysis',
  '/threat-intel': 'Threat Intelligence Feed',
  '/reports': 'Security & Compliance Reports',
  '/logs': 'Activity Logs & Event Stream',
  '/settings': 'System Configuration',
  '/profile': 'SOC Analyst Profile',
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = pageTitles[pathname] ?? 'SentinelAI';

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={`dashboard-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar pageTitle={pageTitle} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
