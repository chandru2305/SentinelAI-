import { ApiService } from './api';

export interface MitreTacticInfo {
  tactic: string;
  count: number;
}

export interface MitreTechniqueInfo {
  technique_id: string;
  technique: string;
  tactic: string;
  count: number;
  severity: string;
  last_detected?: string;
}

export interface MitreStatsResponse {
  tactics: MitreTacticInfo[];
  techniques: MitreTechniqueInfo[];
}

export interface ThreatIndicatorInfo {
  indicator: string;
  type: string;
  first_seen: string;
  last_seen: string;
  count: number;
  categories: string[];
}

export interface ThreatIntelligenceData {
  recent_categories: Array<{ category: string; count: number }>;
  severity_distribution: Record<string, number>;
  top_techniques: MitreTechniqueInfo[];
  indicators: ThreatIndicatorInfo[];
}

export interface ThreatIndicator {
  type: string;
  value: string;
  description: string;
}

export interface MitreMapping {
  technique: string;
  technique_id: string;
  tactic: string;
  description: string;
  reference: string;
}

export interface ThreatRule {
  rule_name: string;
  description: string;
  severity: string;
  category: string;
  confidence: number;
  priority: string;
  mitre: MitreMapping;
  recommended_action: string;
  enabled: boolean;
}

export interface ThreatAnalysisRequest {
  text?: string;
  logs?: string;
  headers?: Record<string, string>;
  url?: string;
  body?: string;
}

export interface ThreatResult {
  category: string;
  rule_name: string;
  severity: string;
  risk_score: number;
  confidence: number;
  priority: string;
  indicators: ThreatIndicator[];
  mitre: MitreMapping;
  recommendation: string;
  details?: string;
}

export interface ThreatAnalysisResponse {
  threats: ThreatResult[];
  risk_score: number;
  highest_severity: string;
  confidence: number;
  priority: string;
  indicators: ThreatIndicator[];
  recommendations: string[];
  mitre: MitreMapping[];
  scanned_at: string;
}

export interface ThreatHistoryItem {
  id: string;
  timestamp: string;
  source?: string;
  category: string;
  rule_name: string;
  input: Record<string, any>;
  detected: boolean;
  risk_score: number;
  severity: string;
  confidence: number;
  processing_time: number;
  status: string;
}

export interface ThreatRecord {
  id: string;
  detected_at: string;
  source?: string;
  category: string;
  rule_name: string;
  severity: string;
  risk_score: number;
  confidence: number;
  priority: string;
  indicators: ThreatIndicator[];
  mitre: MitreMapping;
  recommendation: string;
  status: string;
}

export interface ThreatStats {
  total_scans: number;
  threats_found: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  average_confidence: number;
  last_scan?: string;
  recent_threats: number;
}

export interface ThreatSummary {
  total_scans: number;
  threats_found: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const threatService = {
  async getRules(): Promise<ThreatRule[]> {
    const response = await ApiService.request<ThreatRule[]>('/api/v1/threats/rules');
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  async getRecent(limit = 25): Promise<ThreatRecord[]> {
    const response = await ApiService.request<ThreatRecord[]>(`/api/v1/threats/recent?limit=${limit}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  async getHistory(limit = 50): Promise<ThreatHistoryItem[]> {
    const response = await ApiService.request<ThreatHistoryItem[]>(`/api/v1/threats/history?limit=${limit}`);
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  async getStatistics(): Promise<ThreatSummary> {
    const response = await ApiService.request<ThreatSummary>('/api/v1/threats/statistics');
    if (response.error) throw new Error(response.error);
    return response.data as ThreatSummary;
  },

  async getStats(): Promise<ThreatStats> {
    const response = await ApiService.request<ThreatStats>('/api/v1/threats/stats');
    if (response.error) throw new Error(response.error);
    return response.data as ThreatStats;
  },

  async analyze(request: ThreatAnalysisRequest): Promise<ThreatAnalysisResponse> {
    const response = await ApiService.request<ThreatAnalysisResponse>('/api/v1/threats/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.error) throw new Error(response.error);
    return response.data as ThreatAnalysisResponse;
  },

  async analyzeUrl(url: string): Promise<ThreatAnalysisResponse> {
    const response = await ApiService.request<ThreatAnalysisResponse>('/api/v1/threats/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.error) throw new Error(response.error);
    return response.data as ThreatAnalysisResponse;
  },

  async analyzeFile(filename: string, content: string): Promise<ThreatAnalysisResponse> {
    const response = await ApiService.request<ThreatAnalysisResponse>('/api/v1/threats/file', {
      method: 'POST',
      body: JSON.stringify({ filename, content }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.error) throw new Error(response.error);
    return response.data as ThreatAnalysisResponse;
  },

  async getMitre(): Promise<MitreStatsResponse> {
    const response = await ApiService.request<MitreStatsResponse>('/api/v1/threats/mitre');
    if (response.error) throw new Error(response.error);
    return response.data as MitreStatsResponse;
  },

  async getIndicators(): Promise<ThreatIndicatorInfo[]> {
    const response = await ApiService.request<ThreatIndicatorInfo[]>('/api/v1/threats/indicators');
    if (response.error) throw new Error(response.error);
    return response.data ?? [];
  },

  async getIntelligence(): Promise<ThreatIntelligenceData> {
    const response = await ApiService.request<ThreatIntelligenceData>('/api/v1/threats/intelligence');
    if (response.error) throw new Error(response.error);
    return response.data as ThreatIntelligenceData;
  },
};
