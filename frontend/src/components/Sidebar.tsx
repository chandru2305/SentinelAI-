import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/ai-models', label: 'AI Models' },
  { to: '/ai-scanner', label: 'AI Scanner' },
  { to: '/detection-center', label: 'Detection Center' },
  { to: '/reports', label: 'Reports' },
  { to: '/activity-logs', label: 'Activity Logs' },
  { to: '/settings', label: 'Settings' },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">SentinelAI</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="sidebar-link">
            {link.label}
          </NavLink>
        ))}
        <button type="button" className="sidebar-link sidebar-logout">
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
