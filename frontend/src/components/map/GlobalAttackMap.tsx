

const GlobalAttackMap = () => {
  return (
    <div className="soc-panel">
      <div className="soc-panel-header">
        <div className="soc-panel-title">
          <span className="soc-panel-title-icon">🌍</span>
          Global Attack Vectors & Geolocation Map
        </div>
      </div>
      
      <div className="soc-map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', minHeight: 300 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗺️</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>No geolocated AI-security telemetry available</div>
        <p style={{ marginTop: 8, fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>
          Real-time AI threat detection is active, but geographic correlation data is currently unavailable.
        </p>
      </div>
    </div>
  );
};

export default GlobalAttackMap;
