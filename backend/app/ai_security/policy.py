from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class AgentPolicyRule:
    agent_id: str
    action: str
    environment: str
    decision: str  # ALLOW, WARN, BLOCK
    target_pattern: Optional[str] = None

class AgentPolicyMatrix:
    def __init__(self):
        # A minimal, transparent matrix suitable for SentinelAI Phase 5.
        # agent_id='*' means any agent. environment='*' means any environment.
        self.rules: List[AgentPolicyRule] = [
            # 1. Global Dangerous Action Policies
            AgentPolicyRule(agent_id="*", action="DROP_TABLE", environment="production", decision="BLOCK"),
            AgentPolicyRule(agent_id="*", action="DELETE_DATABASE", environment="production", decision="BLOCK"),
            AgentPolicyRule(agent_id="*", action="EXECUTE_COMMAND", environment="production", decision="BLOCK", target_pattern="rm -rf"),
            AgentPolicyRule(agent_id="*", action="EXECUTE_COMMAND", environment="production", decision="BLOCK", target_pattern="eval"),
            
            # 2. Agent-Specific Policies
            AgentPolicyRule(agent_id="research-agent", action="READ_FILE", environment="*", decision="ALLOW"),
            AgentPolicyRule(agent_id="customer-support-agent", action="DELETE_DATABASE", environment="*", decision="BLOCK"),
            AgentPolicyRule(agent_id="automation-agent", action="NETWORK_REQUEST", environment="*", decision="ALLOW", target_pattern="approved API"),
            AgentPolicyRule(agent_id="automation-agent", action="NETWORK_REQUEST", environment="*", decision="WARN", target_pattern="unknown domain"),
            AgentPolicyRule(agent_id="*", action="ACCESS_SECRET", environment="production", decision="BLOCK"),
            AgentPolicyRule(agent_id="*", action="ACCESS_SECRET", environment="development", decision="WARN"),
            
            # 3. Environment Fallbacks
            AgentPolicyRule(agent_id="*", action="DELETE_FILE", environment="production", decision="BLOCK", target_pattern="protected directory"),
            AgentPolicyRule(agent_id="*", action="*", environment="development", decision="ALLOW") # Permissive dev fallback
        ]

    def evaluate(self, agent_id: str, action: str, environment: str, target: Optional[str] = None) -> Optional[AgentPolicyRule]:
        """Evaluates the action against the policy matrix and returns the first matching rule, if any."""
        for rule in self.rules:
            agent_match = rule.agent_id == "*" or rule.agent_id == agent_id
            action_match = rule.action == "*" or rule.action == action
            env_match = rule.environment == "*" or rule.environment == environment
            
            target_match = True
            if rule.target_pattern and target:
                if rule.target_pattern not in target:
                    target_match = False
            
            if agent_match and action_match and env_match and target_match:
                return rule
                
        return None
