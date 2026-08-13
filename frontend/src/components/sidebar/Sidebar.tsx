import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken } from '../../utils/tokenStorage';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: number;
  category?: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '🛡️', category: 'Operations' },
  { to: '/threat-monitor', label: 'Threat Monitor', icon: '⚠️', badge: 14, category: 'Operations' },
  { to: '/incidents', label: 'Incidents', icon: '🚨', badge: 5, category: 'Operations' },
  { to: '/detection', label: 'Threat Detection', icon: '🛡️', category: 'Operations' },
  { to: '/detection/rules', label: 'Threat Rules', icon: '📋', category: 'Intelligence' },
  { to: '/detection/history', label: 'Threat History', icon: '🕘', category: 'Intelligence' },
  { to: '/detection/intelligence', label: 'Threat Intelligence', icon: '🌐', category: 'Intelligence' },
  { to: '/detection/statistics', label: 'Threat Statistics', icon: '📊', category: 'Intelligence' },
  { to: '/ai-analysis', label: 'AI Analysis', icon: '🤖', category: 'Intelligence' },
  { to: '/threat-analyzer', label: 'Threat Analyzer', icon: '🧪', category: 'Intelligence' },
  { to: '/ai-status', label: 'Model Status', icon: '📈', category: 'Intelligence' },
  { to: '/ai-playground', label: 'AI Playground', icon: '💬', category: 'Intelligence' },
  { to: '/threat-intel', label: 'Threat Intelligence', icon: '🌐', category: 'Intelligence' },
  { to: '/logs', label: 'Logs & Events', icon: '📋', category: 'Telemetry' },
  { to: '/reports', label: 'Reports', icon: '📊', category: 'Telemetry' },
  { to: '/settings', label: 'Settings', icon: '⚙️', category: 'System' },
  { to: '/profile', label: 'Profile', icon: '👤', category: 'System' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  let currentCategory = '';

  return (
    <aside className={`sidebar-container${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-logo-text">SentinelAI SOC</span>}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-menu">
        {navItems.map((item) => {
          const showCategory = !collapsed && item.category && item.category !== currentCategory;
          if (showCategory) {
            currentCategory = item.category!;
          }

          return (
            <div key={item.to}>
              {showCategory && <div className="sidebar-menu-category">{item.category}</div>}
              <NavLink
                to={item.to}
                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
          <span className="sidebar-icon">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
