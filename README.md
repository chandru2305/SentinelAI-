# SentinelAI — Autonomous AI Threat Intelligence & Real-Time SOC Telemetry Platform

SentinelAI is a production-grade, enterprise-ready Security Operations Center (SOC) platform powered by AI model telemetry, rule-based threat detection engines, and real-time WebSocket event streams.

---

## 🏛️ Architecture & System Design

```
                     ┌──────────────────────────────────────────────┐
                     │          React + TypeScript Frontend         │
                     │          Vite SPA, Tailwind & Recharts       │
                     └──────────────────────┬───────────────────────┘
                                            │
                             ┌──────────────┴──────────────┐
                             │                             │
                     HTTP / REST API                WebSocket / WSS
               (JWT Authorization Headers)      (Query Token / Backoff)
                             │                             │
                             └──────────────┬──────────────┘
                                            │
                     ┌──────────────────────▼───────────────────────┐
                     │            FastAPI Backend Engine            │
                     │          ConnectionManager & Routers         │
                     └───────┬──────────────┬──────────────┬────────┘
                             │              │              │
             ┌───────────────┴────┐ ┌───────┴────────┐ ┌───┴────────────────┐
             │ SQLAlchemy Database│ │ Threat Engine  │ │  AI / Ollama Module│
             │ SQLite / Postgres  │ │ Rules & MITRE  │ │  Offline Fallback  │
             └────────────────────┘ └────────────────┘ └────────────────────┘
```

SentinelAI features a decoupled architecture:
1. **Frontend**: React 18 + TypeScript + Vite single page application with modern CSS tokens, dark mode SOC design system, live heatmaps, and Recharts graphs.
2. **Backend**: FastAPI asynchronous Python microservice with SQLAlchemy ORM, SQLite fallback support, PostgreSQL compatibility, and Alembic database migration management.
3. **Real-Time SOC Channel**: Asynchronous WebSocket event broker with exponential backoff reconnection loops and thread-safe event loop dispatchers.
4. **Threat Detection Engine**: Rule-based heuristic pattern analyzer mapping detected payloads directly to MITRE ATT&CK® Enterprise tactics and techniques.
5. **AI Telemetry Assistant**: Ollama LLM integration providing automated threat analysis, context-aware remediation, and robust offline fallback when local LLMs are unreachable.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Core** | React 18, TypeScript, Vite, React Router 6 |
| **Frontend Styling** | Modern Vanilla CSS Custom Properties (Tokens), Glassmorphism, Dark UI |
| **Data Visualization** | Recharts, Custom Inline SVG Heatmaps |
| **Backend Core** | Python 3.10+, FastAPI, Uvicorn |
| **Database & ORM** | SQLAlchemy 2.0, SQLite 3 (Dev Fallback), PostgreSQL (Production), Alembic Migrations |
| **Security & Auth** | OAuth2 Bearer, Passlib (Bcrypt), Python-Jose (JWT) |
| **Real-Time Communication** | Native Async WebSockets (`fastapi.WebSocket`) |
| **AI Infrastructure** | Ollama API Integration (`httpx` HTTP Client) |

---

## 📂 Project Structure

```
SentinelAI/
├── backend/
│   ├── alembic/              # Database migration scripts & versions
│   ├── app/
│   │   ├── ai/               # Ollama AI service, router, schemas, & client
│   │   ├── api/              # API router registrations, dashboard, health endpoints
│   │   ├── auth/             # JWT authentication service, dependencies, models
│   │   ├── core/             # Settings, Pydantic configuration, security environment
│   │   ├── database/         # Engine fallback initialization & SQLAlchemy Base
│   │   ├── realtime/         # ConnectionManager & WebSocket router (/ws)
│   │   ├── tests/            # Automated test suite (health, auth, threats, websocket)
│   │   ├── threats/          # Heuristic rules, MITRE mappings, repository, service
│   │   └── main.py           # FastAPI application entry point & CORS configuration
│   ├── alembic.ini           # Alembic configuration
│   ├── requirements.txt      # Python dependencies
│   └── sentinelai.db         # SQLite local database file
├── docs/                     # Module reports & technical specs
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, MITRE heatmap, alerts, and card components
│   │   ├── config/           # API host and environment configuration
│   │   ├── hooks/            # Custom hooks (useWebSocket, etc.)
│   │   ├── layouts/          # DashboardLayout & ProtectedLayout wrappers
│   │   ├── pages/            # Dashboard, AI, Detection, & Auth views
│   │   ├── services/         # API abstraction layer (api, threatService, dashboardService)
│   │   └── utils/            # JWT token storage utilities
│   ├── index.html            # Vite HTML entry point
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite compiler configuration
├── .env.example              # Root environment template
└── README.md                 # System documentation
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **Ollama** *(Optional for AI features)*: Installed and listening on `http://localhost:11434`

---

### 1. Environment Configuration

Copy the template environment file in the project root or backend folder:

```bash
cp .env.example backend/.env
```

**Key Environment Variables**:
- `APP_ENV`: Set to `development` or `production`.
- `JWT_SECRET`: Secret key used for signing JWT tokens.
- `DATABASE_URL`: Primary database connection string (e.g. `postgresql://user:pass@localhost:5432/sentinelai`). If PostgreSQL is unreachable, SentinelAI automatically falls back to local SQLite (`sentinelai.db`).
- `OLLAMA_BASE_URL`: Ollama API base URL (Default: `http://localhost:11434`).
- `OLLAMA_MODEL`: Target model name (Default: `llama3`).

---

### 2. Backend Startup

1. Navigate to the backend directory and activate your virtual environment:

```bash
cd backend
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Execute database migrations:

```bash
alembic upgrade head
```

4. Launch the FastAPI server with Uvicorn:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend interactive API documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Startup

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node dependencies:

```bash
npm install
```

3. Launch the Vite development server:

```bash
npm run dev
```

Access the SentinelAI SOC Dashboard in your browser at `http://localhost:5173`.

**Default Analyst Credentials**:
- **Username / Email**: `admin` or `admin@sentinelai.local`
- **Password**: `admin123`

---

## ⚡ Key Capabilities & Features

### 🛡️ Rule-Based Threat Detection
Detects SQL Injection (`' OR '1'='1`), Cross-Site Scripting (`<script>alert()</script>`), Command Injection (`rm -rf`), Directory Traversal, Ransomware indicators, and Obfuscated payloads. Automatically calculates priority scores (`P1` - `P4`) and severity levels.

### ⚔️ MITRE ATT&CK® Heatmap Coverage
Dynamically maps detected threats to Enterprise MITRE tactics (Initial Access, Execution, Defense Evasion, etc.) and technique IDs (`T1190`, `T1059.007`, etc.) based on database records.

### 📡 Real-Time WebSocket Telemetry Channel
Clients connect via `/api/v1/ws?token=<JWT>`. Whenever a threat is analyzed and saved to the database, a JSON event payload is thread-safely broadcast across all active client sockets, updating live threat counters, feeds, and heatmaps without page reloads.

### 🤖 AI Engine & Offline Resiliency
Analyzes threat contexts using local Ollama LLMs. If Ollama is offline or uninstalled, SentinelAI safely switches to rule-based fallback messaging, ensuring 100% uptime for critical SOC operations.

---

## 🧪 Testing Commands

### Backend Automated Test Suite
Run the full backend unit test suite covering health, authentication, threat detection, statistics, MITRE aggregation, and WebSocket security:

```bash
cd backend
$env:APP_ENV="development" # PowerShell
python -m unittest discover app/tests
```

### End-to-End API Integration Script
Execute the full API and WebSocket integration verification script:

```bash
cd backend
python C:\Users\CHANDRU\.gemini\antigravity-ide\brain\aaf99e63-4a68-4c3d-843d-5a0e338dd721\scratch\test_integration_module13.py
```

### Frontend Production Build Test
Verify TypeScript compilation and bundle production builds:

```bash
cd frontend
npm run build
```

---

## 📄 License & Attribution
Designed & developed for advanced Security Operations Center monitoring with automated threat telemetry.
