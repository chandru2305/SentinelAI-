const Topbar = () => {
  return (
    <header className="topbar">
      <div className="topbar-title">SentinelAI</div>
      <div className="topbar-actions">
        <span className="topbar-user">admin</span>
        <button type="button" className="topbar-icon">
          🔔
        </button>
        <button type="button" className="topbar-profile">
          ☑
        </button>
      </div>
    </header>
  );
};

export default Topbar;
