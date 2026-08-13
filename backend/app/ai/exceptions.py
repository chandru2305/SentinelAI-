class AIEngineError(Exception):
    """Base exception for AI engine failures."""


class AIProviderError(AIEngineError):
    """Raised when the AI provider cannot fulfill a request."""


class AIParserError(AIEngineError):
    """Raised when the AI provider response cannot be parsed."""


class AIConfigurationError(AIEngineError):
    """Raised when the AI engine is misconfigured."""


class AIUnavailableError(AIEngineError):
    """Raised when the AI provider is offline or unreachable."""
