import { API_BASE_URL } from '../config/api';
import { getToken } from '../utils/tokenStorage';

export interface AIAnalyzeRequest {
  text: string;
  category?: string;
  model?: string;
}

export interface AIAnalyzeResponse {
  risk: string;
  confidence: number;
  attack_type: string;
  reason: string;
  recommendation: string;
  summary?: string;
  threat_type?: string;
  severity?: string;
  risk_score?: number;
  recommendations?: string[];
  indicators?: string[];
  mitre?: Array<Record<string, any>>;
  provider?: string;
  model?: string;
  raw_output?: any;
}

export interface AIStatusResponse {
  available: boolean;
  status: string;          // 'online' | 'offline' | 'error'
  provider: string;
  ollama_running: boolean;
  model: string;
  latency_ms: number;
  version: string;
  message?: string;
  vram_usage?: string;
  ram_usage?: string;
  tokens_per_sec?: number;
  context_size?: number;
  temperature?: number;
}

export interface AIModelInfo {
  name: string;
  loaded: boolean;
  description?: string;
}

export interface AIModelsResponse {
  models: AIModelInfo[];
}

export interface AIConnectivityResponse {
  ok: boolean;
  message: string;
}

export interface AIChatRequest {
  message: string;
  model?: string;
}

export interface AIChatResponse {
  message: string;
}

export interface AIChangeModelRequest {
  model: string;
}

export interface AIChangeModelResponse {
  ok: boolean;
  model: string;
  message: string;
}

// Structured security analysis
export interface AISecurityAnalysis {
  threat_type: string;
  severity: string;        // CRITICAL | HIGH | MEDIUM | LOW | INFO | UNKNOWN
  confidence: number;      // 0.0 – 1.0
  explanation: string;
  indicators: string[];
  recommended_actions: string[];
  mitre_tactic: string;
  mitre_technique: string;
}

export interface AISecurityAnalysisRequest {
  input: string;
  context?: string;
  model?: string;
}

export interface AISecurityAnalysisResponse {
  success: boolean;
  analysis?: AISecurityAnalysis;
  error?: string;
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const aiService = {
  async analyze(text: string): Promise<AIAnalyzeResponse> {
    return fetchJson<AIAnalyzeResponse>(`/api/v1/ai/analyze`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
  },

  async analyzeSecurityEvent(request: AISecurityAnalysisRequest): Promise<AISecurityAnalysisResponse> {
    return fetchJson<AISecurityAnalysisResponse>(`/api/v1/ai/analyze/security`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(request),
    });
  },

  async status(): Promise<AIStatusResponse> {
    return fetchJson<AIStatusResponse>(`/api/v1/ai/status`, {
      headers: authHeaders(),
    });
  },

  async models(): Promise<AIModelsResponse> {
    return fetchJson<AIModelsResponse>(`/api/v1/ai/models`, {
      headers: authHeaders(),
    });
  },

  async test(): Promise<AIConnectivityResponse> {
    return fetchJson<AIConnectivityResponse>(`/api/v1/ai/test`, {
      method: 'POST',
      headers: authHeaders(),
    });
  },

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    return fetchJson<AIChatResponse>(`/api/v1/ai/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(request),
    });
  },

  async changeModel(request: AIChangeModelRequest): Promise<AIChangeModelResponse> {
    return fetchJson<AIChangeModelResponse>(`/api/v1/ai/change-model`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(request),
    });
  },
};
