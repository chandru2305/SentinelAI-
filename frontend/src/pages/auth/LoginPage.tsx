import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ username_or_email: usernameOrEmail, password });
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fadein-up">
        <div className="login-header">
          <div className="login-logo">🛡️</div>
          <h1 className="login-title">SentinelAI</h1>
          <p className="login-subtitle">Security Operations Center</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username or Email
            </label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="admin@sentinelai.local"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In…' : 'Sign In to SOC'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          SentinelAI v0.4.0 · Secured by AI-Powered Threat Detection
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
