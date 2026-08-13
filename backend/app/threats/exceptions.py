class ThreatDetectionError(Exception):
    """Base exception for threat detection failures."""


class ThreatValidationError(ThreatDetectionError):
    """Raised when a request payload is invalid or malformed."""


class ThreatRepositoryError(ThreatDetectionError):
    """Raised when threat storage or retrieval fails."""
