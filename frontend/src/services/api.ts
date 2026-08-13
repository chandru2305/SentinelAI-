import { API_BASE_URL } from '../config/api';
import { getToken } from '../utils/tokenStorage';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiService {
  static async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers = new Headers(init?.headers);
    const token = getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      return { error: response.statusText };
    }

    const data = (await response.json()) as T;
    return { data };
  }
}
