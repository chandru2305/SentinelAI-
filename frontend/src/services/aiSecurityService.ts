import { ApiService } from './api';

export interface AISecurityMatch {
  rule_name: string;
  category: string;
  severity: string;
  confidence: number;
  details: string;
  mitre_tactic?: string;
  mitre_technique?: string;
}

export interface AISecurityDecision {
  allowed: boolean;
  action: 'ALLOW' | 'WARN' | 'BLOCK';
  overall_risk: number;
  severity: string;
  threat_count: number;
  matches: AISecurityMatch[];
  explanation: string;
  remediation: string;
  processing_time_ms: number;
  timestamp: string;
}

export interface AISecurityMetrics {
  total_inspections: number;
  threats_blocked: number;
  prompt_injections: number;
  jailbreak_attempts: number;
  agent_violations: number;
  avg_risk_score: number;
}

export interface AISecurityIndicator {
  type: string;
  location: string;
  masked_value: string;
}

export interface AISecurityResponseDecision {
  safe: boolean;
  threat_type: string;
  severity: string;
  confidence: number;
  risk_score: number;
  policy_decision: 'ALLOW' | 'WARN' | 'BLOCK';
  explanation: string;
  indicators: AISecurityIndicator[];
  recommended_actions: string[];
  model?: string;
  processing_time_ms: number;
  timestamp: string;
}

export const aiSecurityService = {
  async inspectPrompt(prompt: string, systemPrompt?: string, agentId?: string): Promise<AISecurityDecision> {
    const res = await ApiService.request<AISecurityDecision>('/ai-security/inspect-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system_prompt: systemPrompt, agent_id: agentId }),
    });
    if (res.error || !res.data) throw new Error(res.error || 'Failed to inspect prompt');
    return res.data;
  },

  async inspectAgentAction(agentId: string, toolName: string, toolArguments: Record<string, any>): Promise<AISecurityDecision> {
    const res = await ApiService.request<AISecurityDecision>('/ai-security/inspect-agent-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, tool_name: toolName, tool_arguments: toolArguments }),
    });
    if (res.error || !res.data) throw new Error(res.error || 'Failed to inspect agent action');
    return res.data;
  },

  async inspectResponse(response: string, context?: string, model?: string): Promise<AISecurityResponseDecision> {
    const res = await ApiService.request<AISecurityResponseDecision>('/ai-security/inspect-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, context, model }),
    });
    if (res.error || !res.data) throw new Error(res.error || 'Failed to inspect LLM response');
    return res.data;
  },

  async getMetrics(): Promise<AISecurityMetrics> {
    const res = await ApiService.request<AISecurityMetrics>('/ai-security/metrics');
    if (res.error || !res.data) throw new Error(res.error || 'Failed to fetch metrics');
    return res.data;
  },
};
