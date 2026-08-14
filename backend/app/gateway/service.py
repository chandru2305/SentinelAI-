import logging
import time
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.ai.provider import AIProviderFactory
from app.ai_security.schemas import (
    AISecurityInspectRequest,
    AISecurityResponseInspectRequest,
)
from app.ai_security.service import AISecurityService
from app.gateway.schemas import (
    GatewayChatRequest,
    GatewayChatResponse,
    GatewaySecurityEvent,
    GatewayStatusResponse,
)

logger = logging.getLogger(__name__)

class GatewayService:
    def __init__(self):
        self.ai_security = AISecurityService()

    def gateway_status(self) -> GatewayStatusResponse:
        try:
            provider = AIProviderFactory.create('ollama')
            status = provider.status()
            provider_ok = status.ollama_running
            model = status.model
        except Exception as e:
            logger.warning("Gateway status provider check failed: %s", e)
            provider_ok = False
            model = "unknown"

        return GatewayStatusResponse(
            gateway_online=True,
            provider_available=provider_ok,
            active_provider="ollama",
            active_model=model,
            security_engine_available=True
        )

    def chat(self, request: GatewayChatRequest, db: Session) -> GatewayChatResponse:
        request_id = str(uuid.uuid4())
        
        # 1. Extract messages
        user_prompt = ""
        system_prompt = ""
        for msg in request.messages:
            if msg.role == "user":
                user_prompt += msg.content + "\n"
            elif msg.role == "system":
                system_prompt += msg.content + "\n"
        
        user_prompt = user_prompt.strip()
        system_prompt = system_prompt.strip()
        if not user_prompt:
            user_prompt = " "

        # 2. Inspect prompt using existing engine
        inspect_req = AISecurityInspectRequest(
            prompt=user_prompt,
            system_prompt=system_prompt if system_prompt else None,
            agent_id=request.agent_id,
            request_id=request_id
        )
        
        try:
            prompt_decision = self.ai_security.inspect_prompt(inspect_req, db)
        except Exception as e:
            logger.error("Security Engine failed during prompt inspection: %s", e)
            # Fail safe: BLOCK
            return GatewayChatResponse(
                request_id=request_id,
                decision="BLOCK",
                request_security=GatewaySecurityEvent(
                    decision="BLOCK",
                    risk_score=100,
                    threat_type="Security Engine Failure",
                    message="Request blocked due to security engine failure."
                )
            )

        req_event = GatewaySecurityEvent(
            decision=prompt_decision.action,
            risk_score=prompt_decision.overall_risk,
            threat_type=prompt_decision.matches[0].category if prompt_decision.matches else None,
            message=prompt_decision.explanation
        )

        if prompt_decision.action == "BLOCK":
            return GatewayChatResponse(
                request_id=request_id,
                decision="BLOCK",
                request_security=req_event
            )

        # 3. Call upstream provider
        try:
            provider = AIProviderFactory.create(request.provider)
            messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
            
            start_time = time.perf_counter()
            response_data = provider.chat(messages_dict, request.model)
            upstream_latency = (time.perf_counter() - start_time) * 1000.0
            
            # Provider output structure can vary, handle standard Ollama response
            upstream_text = response_data.get("message", {}).get("content", "")
            if not upstream_text and "response" in response_data:
                upstream_text = response_data["response"]
                
        except Exception as e:
            logger.error("Upstream provider failed: %s", e)
            return GatewayChatResponse(
                request_id=request_id,
                decision="BLOCK",
                request_security=req_event,
                response_security=GatewaySecurityEvent(
                    decision="BLOCK",
                    risk_score=100,
                    threat_type="Upstream Failure",
                    message="Failed to get response from upstream provider."
                )
            )

        # 4. Inspect response
        resp_inspect_req = AISecurityResponseInspectRequest(
            response=upstream_text,
            context=user_prompt,
            model=request.model or "unknown",
            request_id=request_id
        )
        
        try:
            resp_decision = self.ai_security.inspect_llm_response(resp_inspect_req, db)
        except Exception as e:
            logger.error("Security Engine failed during response inspection: %s", e)
            return GatewayChatResponse(
                request_id=request_id,
                decision="BLOCK",
                request_security=req_event,
                upstream_latency_ms=upstream_latency,
                response_security=GatewaySecurityEvent(
                    decision="BLOCK",
                    risk_score=100,
                    threat_type="Security Engine Failure",
                    message="Response blocked due to security engine failure."
                )
            )

        res_event = GatewaySecurityEvent(
            decision=resp_decision.policy_decision,
            risk_score=resp_decision.risk_score,
            threat_type=resp_decision.indicators[0].type if resp_decision.indicators else None,
            message=resp_decision.explanation
        )

        final_decision = "BLOCK" if resp_decision.policy_decision == "BLOCK" else "WARN" if (req_event.decision == "WARN" or res_event.decision == "WARN") else "ALLOW"

        return GatewayChatResponse(
            request_id=request_id,
            decision=final_decision,
            request_security=req_event,
            response_security=res_event,
            final_response=upstream_text if final_decision != "BLOCK" else None,
            upstream_latency_ms=upstream_latency
        )
