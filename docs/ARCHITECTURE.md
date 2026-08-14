# SentinelAI Architecture

This document describes the implemented architecture of the SentinelAI AI Security Platform.

## System Flow

```text
       Client Application (AI Application)
                   │
                   ▼
         SentinelAI Gateway
                   │
                   ▼
             Prompt Security
                   │
                   ▼
               RAG Security
                   │
                   ▼
              Agent Security
                   │
                   ▼
              Risk / Policy
                   │
           (ALLOW / WARN / BLOCK)
                   │
                   ▼ (If Allowed)
              LLM Provider (Ollama)
                   │
                   ▼ (Response returned)
             Response Security
                   │
                   ▼ (Logs telemetry)
                Database
                   │
                   ▼
            WebSocket Telemetry
                   │
                   ▼
           AI Security Center (Frontend)
```

## Core AI Security Modules

The following components represent the **CORE AI SECURITY** functionality of the platform:
- **Prompt Security:** Intercepts and scores incoming prompts for prompt injection, jailbreaks, and system prompt extraction.
- **RAG Security:** Inspects context documents for data poisoning and indirect prompt injection.
- **Agent Security:** Validates agent tool executions and boundaries against a predefined permission matrix.
- **Response Security:** Inspects final LLM output for secrets, PII, and data exfiltration indicators before it reaches the client.
- **Risk / Policy Engine:** Aggregates risk scores and enforces final authorization decisions.
- **Inline Gateway:** The reverse-proxy router that orchestrates the interception and security inspection cycle.

## Supporting Infrastructure

The following components are **SUPPORTING INFRASTRUCTURE** that facilitate the product's operation:
- **AI Security Center (Frontend):** React dashboard for SOC analysts to view telemetry.
- **Database (SQLAlchemy/Alembic):** Persists threat logs and telemetry.
- **WebSocket Telemetry Engine:** Broadcasts real-time events to connected clients.
- **Authentication (JWT):** Secures the REST API and WebSocket channels.
