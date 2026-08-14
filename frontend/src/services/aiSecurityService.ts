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

export interface AISecurityRagDecision {
  safe: boolean;
  threat_type: string;
  severity: string;
  confidence: number;
  risk_score: number;
  policy_decision: 'ALLOW' | 'WARN' | 'BLOCK';
  explanation: string;
  indicators: AISecurityIndicator[];
  recommended_actions: string[];
  processing_time_ms: number;
  timestamp: string;
}

export interface AIAgentActionInspectRequest {
  agent_id: string;
  agent_name?: string;
  action: string;
  tool: string;
  target?: string;
  environment: string;
  parameters: Record<string, any>;
}

export interface AIAgentActionDecision {
  agent_id: string;
  action: string;
  risk_score: number;
  confidence: number;
  severity: string;
  policy_decision: 'ALLOW' | 'WARN' | 'BLOCK';
  explanation: string;
  recommended_action: string;
  timestamp: string;
}

export interface GatewayMessage {
  role: string;
  content: string;
}

export interface GatewaySecurityEvent {
  decision: string;
  risk_score: number;
  threat_type?: string;
  message: string;
}

export interface GatewayChatResponse {
  request_id: string;
  decision: string;
  request_security: GatewaySecurityEvent;
  response_security?: GatewaySecurityEvent;
  final_response?: string;
  upstream_latency_ms?: number;
}

export interface GatewayStatusResponse {
  gateway_online: boolean;
  provider_available: boolean;
  active_provider: string;
  active_model: string;
  security_engine_available: boolean;
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

  async inspectAgentAction(request: AIAgentActionInspectRequest): Promise<AIAgentActionDecision> {
    const res = await ApiService.request<AIAgentActionDecision>('/ai-security/inspect-agent-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
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

  async inspectRag(documents: {document_id: string, content: string, source_uri?: string}[]): Promise<AISecurityRagDecision> {
    const res = await ApiService.request<AISecurityRagDecision>('/ai-security/inspect-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents }),
    });
    if (res.error || !res.data) throw new Error(res.error || 'Failed to inspect RAG documents');
    return res.data;
  },

  async getMetrics(): Promise<AISecurityMetrics> {
    const res = await ApiService.request<AISecurityMetrics>('/ai-security/metrics');
    if (res.error || !res.data) throw new Error(res.error || 'Failed to fetch metrics');
    return res.data;
  },

  async gatewayStatus(): Promise<GatewayStatusResponse> {
    const res = await ApiService.request<GatewayStatusResponse>('/gateway/status');
    if (res.error || !res.data) throw new Error(res.error || 'Failed to fetch gateway status');
    return res.data;
  },

  async gatewayChat(provider: string, messages: GatewayMessage[], model?: string, ragContext?: string[], agentId?: string): Promise<GatewayChatResponse> {
    const res = await ApiService.request<GatewayChatResponse>('/gateway/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model, messages, rag_context: ragContext, agent_id: agentId }),
    });
    if (res.error || !res.data) throw new Error(res.error || 'Failed to call gateway chat');
    return res.data;
  },
};
