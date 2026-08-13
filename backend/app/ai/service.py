import logging
from typing import Optional

from app.ai.exceptions import AIEngineError, AIParserError, AIUnavailableError
from app.ai.models import AIAnalyzeResult, AIStatusInfo
from app.ai.parser import parse_ai_response, parse_security_analysis
from app.ai.prompts import PROMPT_TEMPLATES
from app.ai.provider import AIProviderFactory
from app.ai.schemas import AISecurityAnalysis
from app.core.config import settings

logger = logging.getLogger(__name__)

_SECURITY_ANALYSIS_PROMPT = (
    "You are a cybersecurity analyst. Analyze the following security input and return ONLY a JSON object "
    "with these exact fields: threat_type, severity (CRITICAL/HIGH/MEDIUM/LOW/INFO/UNKNOWN), "
    "confidence (0.0-1.0), explanation, indicators (array of strings), "
    "recommended_actions (array of strings), mitre_tactic, mitre_technique.\n\n"
    "Input:\n{input}\n\nContext: {context}\n\n"
    "Return only valid JSON, no additional text."
)


class AIService:
    def __init__(self, provider_name: str = 'ollama', provider: Optional[object] = None) -> None:
        try:
            self.provider = provider or AIProviderFactory.create(provider_name)
            self._available = True
        except Exception as exc:
            logger.warning('AI provider could not be initialized: %s', exc)
            self.provider = None
            self._available = False

    def _is_ready(self) -> bool:
        return self.provider is not None

    def analyze_text(self, text: str, category: str = 'prompt_injection', model: Optional[str] = None) -> AIAnalyzeResult:
        if not self._is_ready():
            return self._unavailable_result()
        max_size = getattr(settings, 'max_prompt_size', 4096)
        truncated_text = text[:max_size] if text else ""
        prompt_template = PROMPT_TEMPLATES.get(category, PROMPT_TEMPLATES['prompt_injection'])
        prompt = prompt_template.format(text=truncated_text)
        try:
            raw = self.provider.generate(prompt, model=model)
        except AIUnavailableError:
            return self._unavailable_result()

        if not isinstance(raw, dict) or 'output' not in raw:
            return self._unavailable_result('Invalid AI provider response format')

        output_text = raw['output']
        if isinstance(output_text, list):
            output_text = output_text[0] if output_text else ''

        result = parse_ai_response(str(output_text))
        logger.info('AI analyze completed: risk=%s, attack_type=%s, confidence=%s', result.risk, result.attack_type, result.confidence)
        return AIAnalyzeResult(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )

    def _unavailable_result(self, message: str = 'AI service unavailable') -> AIAnalyzeResult:
        return AIAnalyzeResult(
            risk='Unknown',
            confidence=0,
            attack_type='Unavailable',
            reason=message,
            recommendation='Ensure Ollama is running and the configured model is loaded.',
        )

    def analyze_log(self, text: str, model: Optional[str] = None) -> AIAnalyzeResult:
        return self.analyze_text(text, category='log_analysis', model=model)

    def analyze_code(self, text: str, model: Optional[str] = None) -> AIAnalyzeResult:
        return self.analyze_text(text, category='code_review', model=model)

    def analyze_url(self, text: str, model: Optional[str] = None) -> AIAnalyzeResult:
        return self.analyze_text(text, category='url_analysis', model=model)

    def analyze_email(self, text: str, model: Optional[str] = None) -> AIAnalyzeResult:
        return self.analyze_text(text, category='email_analysis', model=model)

    def analyze_security_event(
        self,
        input_text: str,
        context: str = 'security event',
        model: Optional[str] = None,
    ) -> AISecurityAnalysis:
        """Run structured security analysis. Returns a fallback object if AI is unavailable."""
        if not self._is_ready():
            return AISecurityAnalysis(
                explanation='AI service is not configured or unavailable.',
                recommended_actions=['Ensure Ollama is running and the model is loaded.'],
            )

        max_size = getattr(settings, 'max_prompt_size', 4096)
        prompt = _SECURITY_ANALYSIS_PROMPT.format(input=input_text[:max_size] if input_text else "", context=context or 'security event')
        try:
            raw = self.provider.generate(prompt, model=model)
        except AIUnavailableError:
            return AISecurityAnalysis(
                explanation='AI provider is offline. Rule-based detection is still active.',
                recommended_actions=['Start Ollama and load the configured model.'],
            )
        except AIEngineError as exc:
            logger.error('AI security analysis failed: %s', exc)
            return AISecurityAnalysis(explanation=str(exc))

        output_text = raw.get('output', '') if isinstance(raw, dict) else ''
        if isinstance(output_text, list):
            output_text = output_text[0] if output_text else ''

        return parse_security_analysis(str(output_text))

    def chat(self, message: str, model: Optional[str] = None) -> dict[str, str]:
        if not self._is_ready():
            return {'message': 'AI service is unavailable. Please ensure Ollama is running.'}
        max_size = getattr(settings, 'max_prompt_size', 4096)
        truncated_message = message[:max_size] if message else ""
        try:
            raw = self.provider.generate(truncated_message, model=model)
        except AIUnavailableError:
            return {'message': 'AI provider is currently offline. Please try again later.'}

        if not isinstance(raw, dict) or 'output' not in raw:
            return {'message': 'AI returned an unexpected response format.'}

        output_text = raw['output']
        if isinstance(output_text, list):
            output_text = output_text[0] if output_text else ''

        return {'message': str(output_text)}

    def change_model(self, model: str) -> bool:
        if not self._is_ready():
            raise AIEngineError('AI provider is not initialized')
        if hasattr(self.provider, 'change_model'):
            return self.provider.change_model(model)
        raise AIEngineError('Provider does not support model switching')

    def safe_status(self) -> AIStatusInfo:
        """Return AI status without raising — returns offline sentinel on failure."""
        model_name = settings.ollama_model or 'unknown'
        if not self._is_ready():
            return AIStatusInfo(
                ollama_running=False,
                model=model_name,
                latency_ms=0.0,
                version='unknown',
                available=False,
                status='offline',
                message='AI provider is not configured',
            )
        try:
            info = self.provider.status()
            # Ensure new fields are present (backwards compat)
            if not hasattr(info, 'available'):
                info.available = True
            if not hasattr(info, 'status'):
                info.status = 'online'
            return info
        except AIUnavailableError as exc:
            logger.warning('AI provider offline: %s', exc)
            return AIStatusInfo(
                ollama_running=False,
                model=model_name,
                latency_ms=0.0,
                version='unknown',
                available=False,
                status='offline',
                message=str(exc),
            )
        except Exception as exc:
            logger.error('Unexpected error checking AI status: %s', exc)
            return AIStatusInfo(
                ollama_running=False,
                model=model_name,
                latency_ms=0.0,
                version='unknown',
                available=False,
                status='error',
                message=str(exc),
            )

    def status(self):
        return self.provider.status() if self._is_ready() else self.safe_status()

    def list_models(self):
        if not self._is_ready():
            return []
        try:
            return self.provider.models()
        except (AIUnavailableError, AIEngineError):
            return []

    def test_connection(self) -> bool:
        info = self.safe_status()
        return info.available
