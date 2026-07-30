import { useEffect, useState } from 'react';
import { authService } from '../../services/auth';

const MePage = () => {
  const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '2rem' }}>
      <h2>Profile</h2>
      {user ? (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Unable to load profile.</p>
      )}
    </div>
  );
};

export default MePage;
