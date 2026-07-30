# SentinelAI - System Architecture

## Architecture Style

SentinelAI follows a **Modular Monolith Architecture**.

The application is developed as a single deployable system where each module is logically separated. This approach keeps development simple while allowing future expansion if needed.

---

# High-Level Architecture

```text
                    Users
                        │
                        ▼
        ┌──────────────────────────┐
        │     React Frontend        │
        │ Dashboard + AI Assistant  │
        └─────────────┬─────────────┘
                      │ HTTPS REST API
                      ▼
        ┌──────────────────────────┐
        │      FastAPI Backend      │
        └─────────────┬─────────────┘
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼

 Platform Core   Enterprise Security   AI Security

      │               │                │
      └───────────────┼────────────────┘
                      ▼
                  AI Engine
                      │
             AI Provider Interface
                      │
      ┌───────────────┼────────────────┐
      │               │                │
   Ollama         OpenAI         Azure OpenAI
(Default)        (Optional)      (Optional)

                      │
                      ▼
        PostgreSQL + Redis + File Storage
```

---

# Frontend Responsibilities

The frontend is responsible for:

* User Interface
* Authentication screens
* Dashboard
* Incident pages
* AI Security pages
* Reports
* Administration
* AI Chat interface

The frontend never communicates directly with databases or AI models.

---

# Backend Responsibilities

The backend is responsible for:

* Authentication
* Authorization
* Business Logic
* REST APIs
* Security Processing
* AI Integration
* Database Communication

The backend acts as the central coordinator of the platform.

---

# Platform Core

The Platform Core contains services shared across the entire application.

Examples:

* Authentication
* Role-Based Access Control (RBAC)
* Audit Logs
* Notifications
* Configuration
* User Management

---

# Enterprise Security Module

Responsibilities include:

* Alert Management
* Incident Management
* MITRE ATT&CK Mapping
* Threat Investigation
* Security Dashboard Data

---

# AI Security Module

Responsibilities include:

* Prompt Injection Detection
* Jailbreak Detection
* AI Risk Scoring
* AI Application Monitoring
* AI Security Findings

---

# AI Engine

The AI Engine provides intelligent assistance.

Capabilities include:

* Security Chat Assistant
* Incident Explanation
* Report Generation
* Investigation Assistance
* Security Recommendations

The AI Engine must use an AI Provider Interface so that different providers can be swapped without changing application logic.

---

# Database

Primary storage:

* PostgreSQL

Caching:

* Redis

Files:

* Local Storage (Version 1)

---

# External Integrations

Future integrations may include:

* Microsoft Entra ID
* Azure
* AWS
* Threat Intelligence APIs
* SIEM Connectors
* EDR Platforms

These integrations are optional and must not be required for the platform to function.

---

# Architectural Principles

* Keep modules independent.
* Avoid duplicated business logic.
* Maintain clean separation between frontend and backend.
* Keep AI isolated through the AI Provider Interface.
* Prefer simplicity over unnecessary complexity.
* Build features incrementally while preserving architecture consistency.

---

# Version 1 Boundaries

Version 1 focuses on:

* Local deployment
* Modular architecture
* Free AI provider (Ollama)
* Enterprise-ready code structure
* Core AI Security capabilities

Advanced cloud-scale features will be considered only after Version 1 is stable.
