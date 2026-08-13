import { API_BASE_URL } from '../config/api';
import { getToken } from '../utils/tokenStorage';

// ===================== TYPES =====================
export interface DashboardSummary {
  threats_detected: number;
  threats_blocked: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
  average_confidence: number;
  recent_threats: number;
  system_health: number;
  ai_status: string;
}

export interface DashboardActivity {
  id: string;
  time: string;
  threat: string;
  severity: string;
  status: string;
  source: string;
  confidence?: number;
  risk_score?: number;
  rule_name?: string;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  time: string;
  source?: string;
}

export interface DashboardSystem {
  ollama_status: string;
  model_loaded: string;
  last_scan: string;
  ai_confidence: number;
  response_time_ms: number;
  threats_analyzed?: number;
  timestamp?: string;
}

// ===================== HELPER =====================
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

// ===================== SERVICE =====================
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return fetchJson<DashboardSummary>('/api/v1/dashboard/summary');
  },

  async getActivity(): Promise<DashboardActivity[]> {
    return fetchJson<DashboardActivity[]>('/api/v1/dashboard/activity');
  },

  async getAlerts(): Promise<DashboardAlert[]> {
    return fetchJson<DashboardAlert[]>('/api/v1/dashboard/alerts');
  },

  async getSystem(): Promise<DashboardSystem> {
    return fetchJson<DashboardSystem>('/api/v1/dashboard/system');
  },
};
