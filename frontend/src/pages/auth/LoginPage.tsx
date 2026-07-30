import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await authService.login({ username_or_email: usernameOrEmail, password });
    navigate('/me');
  };

  return (
    <div style={{ maxWidth: 360, margin: '3rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username or Email</label>
          <input value={usernameOrEmail} onChange={(event) => setUsernameOrEmail(event.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.75rem' }}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
