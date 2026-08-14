# SentinelAI

SentinelAI is a production-hardened AI Security Platform designed to protect AI applications, LLM applications, RAG pipelines, and AI agents from AI-specific security threats. It sits inline between clients and AI providers to inspect, score, and enforce security policies on prompts and model responses in real-time.

## 1. Product Overview
SentinelAI protects the modern AI attack surface by validating prompts, restricting dangerous AI agent actions, sanitizing LLM responses, and ensuring safe Retrieval-Augmented Generation (RAG) execution.

## 2. Original Product Vision
The original and permanent product boundary for SentinelAI is exclusively AI application security. It does not operate as a traditional network SOC, firewall, or EDR. The vision strictly focuses on Prompt Security, Response Security, RAG Security, Agent Security, and AI Risk Policy enforcement.

## 3. Core AI Security Capabilities
- **Prompt Security:** Detects prompt injections, jailbreak attempts, and system prompt extraction attacks.
- **LLM Response Security:** Inspects outputs for data exfiltration, sensitive data leakage, and enforces secret masking before returning data to the client.
- **RAG Security:** Prevents indirect prompt injection, detects document poisoning, and validates content provenance.
- **AI Agent Security:** Enforces permission matrices to detect and block destructive or unauthorized agent actions.
- **Inline Gateway:** Operates as a reverse proxy, inspecting requests before they reach the provider and responses before they reach the client.

## 4. Architecture
SentinelAI is designed with a decoupled architecture:
1. **Frontend**: React 18 + TypeScript single page application (AI Security Center).
2. **Backend Engine**: FastAPI asynchronous microservice orchestrating security detectors and policy decisions.
3. **Real-Time SOC Channel**: Asynchronous WebSocket event broker broadcasting AI security incidents.
4. **AI Security Engine**: Core validation logic parsing heuristics, risk scores, and generating ALLOW / WARN / BLOCK decisions.

## 5. Technology Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| **Backend** | Python 3.13, FastAPI, Uvicorn |
| **Database & ORM** | SQLAlchemy 2.0, SQLite 3 (Default), Alembic |
| **Security & Auth** | OAuth2 Bearer, Passlib (Bcrypt), Python-Jose (JWT) |
| **Real-Time** | Native Async WebSockets (`fastapi.WebSocket`) |
| **AI Validation Provider** | Ollama API Integration (`httpx` HTTP Client) |

## 6. Project Structure
```text
SentinelAI/
├── backend/
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── ai/               # AI provider connections (Ollama)
│   │   ├── ai_security/      # Core AI Security Engine (Prompt, Response, RAG, Agent)
│   │   ├── api/              # API router registrations
│   │   ├── auth/             # JWT authentication
│   │   ├── gateway/          # Inline AI Security Gateway service
│   │   ├── realtime/         # WebSocket manager
│   │   ├── tests/            # Full automated test suite
│   │   └── main.py           # FastAPI entry point
│   ├── alembic.ini           
│   └── requirements.txt      
├── docs/                     # Technical specifications and reports
├── frontend/                 # React UI for AI Security Center
└── .env.example              # Environment variables
```

## 7. Prompt Security
Inspects user input sequences for hidden commands, malicious framing, or role-playing jailbreaks designed to subvert system instructions.

## 8. LLM Response Security
Post-generation inspection to guarantee the LLM is not inadvertently leaking system tokens, internal IPs, passwords, or executing data exfiltration.

## 9. RAG Security
Analyzes retrieved context chunks to ensure external data fetched via RAG does not contain indirect prompt injections (document poisoning).

## 10. AI Agent Security
Validates intended tool calls or agent actions against an environment-aware policy matrix to prevent destructive system actions.

## 11. Inline AI Security Gateway
Acts as a transparent proxy. The client sends chat requests to SentinelAI. The Gateway inspects the prompt; if ALLOWED, it passes it to the upstream LLM (e.g., Ollama). Once the LLM generates a response, it is intercepted, inspected, and then returned to the client.

## 12. Risk / Policy Engine
Computes a final risk score (0-100) based on all detectors, enforcing the global ALLOW, WARN, or BLOCK policy.

## 13. WebSocket Real-Time Security
Threat telemetry is broadcasted via secure WebSocket connections (`/api/v1/ws`) to the AI Security Center for real-time dashboard updates.

## 14. Authentication
Standard JWT (JSON Web Token) authentication is required for both the REST API and the WebSocket telemetry channel.

## 15. Database / Alembic
Data persistence is handled by SQLAlchemy with SQLite by default. Schema updates are strictly managed via Alembic migrations.

## 16. Ollama Setup
The Gateway currently targets Ollama as the active local LLM provider. Ensure Ollama is running and accessible (e.g., `http://localhost:11434`) with the model specified in the configuration (e.g., `llama3`).

## 17. Environment Variables
Copy `.env.example` to `backend/.env`. Key configurations:
- `JWT_SECRET`: Random string for token signing.
- `DATABASE_URL`: Connection string (defaults to SQLite).
- `OLLAMA_URL`: Connection string for the LLM provider.
- `OLLAMA_MODEL`: Target model (e.g., `llama3`).

## 18. Local Development
1. **Backend**: `python -m venv .venv`, `pip install -r requirements.txt`, `alembic upgrade head`, `python -m uvicorn app.main:app --port 8000`
2. **Frontend**: `npm install`, `npm run dev`

## 19. Testing
Run the backend test suite:
```bash
cd backend
python -m unittest discover app/tests
```

Build the frontend:
```bash
npm run build --prefix frontend
```

## 20. Clean-Machine Validation
SentinelAI can be validated on a fresh machine sequence:
```bash
git clone <repo>
cd SentinelAI-/backend
python -m venv .venv
# activate venv
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --port 8000

# In another terminal:
cd SentinelAI-/frontend
npm ci
npm run build
```

## 21. Current Limitations
- Currently, Ollama is the only fully implemented and verified LLM provider.
- The Global Attack Map visualization does not use real external threat intelligence or live geolocation data.
- Cloud LLM API integration (e.g., OpenAI, Anthropic) requires extending the Gateway provider adapter.
- E2E browser automation tests (e.g., Playwright) are not currently implemented.
