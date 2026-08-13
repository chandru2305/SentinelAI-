from app.ai.models import AIAnalyzeResult
from app.ai.schemas import AIAnalyzeResponse


class AIRepository:
    def __init__(self) -> None:
        self._history: list[AIAnalyzeResponse] = []

    def save_analysis(self, result: AIAnalyzeResponse) -> AIAnalyzeResponse:
        self._history.append(result)
        return result

    def get_history(self) -> list[AIAnalyzeResponse]:
        return list(self._history)
