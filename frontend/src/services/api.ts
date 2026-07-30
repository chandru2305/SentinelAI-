import { API_BASE_URL } from '../config/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiService {
  static async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${path}`, init);

    if (!response.ok) {
      return { error: response.statusText };
    }

    const data = (await response.json()) as T;
    return { data };
  }
}
