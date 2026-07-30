import { API_BASE_URL } from '../config/api';
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';

interface LoginPayload {
  username_or_email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

interface MeResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = (await response.json()) as LoginResponse;
    saveToken(data.access_token);
    return data;
  },

  async logout(): Promise<void> {
    removeToken();
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },

  async getMe(): Promise<MeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    return response.json() as Promise<MeResponse>;
  },
};
