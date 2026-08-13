# Changelog

All notable changes to the SentinelAI platform are documented in this file.

---

## [1.0.0] - Production Hardening & Release

### Added
- **Alembic Database Migrations**: Initialized database migration directory and generated initial schema migration (`7b5c7b311bc0_initial_sentinelai_database_schema.py`) for `users` and `threats` tables.
- **Comprehensive Backend Unit Test Suite**: Created modular test suites in `app/tests/` (`test_health.py`, `test_auth.py`, `test_threats.py`, `test_dashboard.py`, `test_ai.py`, `test_websocket.py`) covering health, JWT authentication, unauthorized access rejection, rule-based threat scans, MITRE aggregation, indicators extraction, AI offline fallback, and WebSocket authentication & connection lifecycle.
- **WebSocket Real-Time Broadcast Architecture**: Exposes `/api/v1/ws` with query token validation, client management, exponential backoff reconnection loops, and thread-safe event loop scheduling.
- **Data-Driven MITRE ATT&CK® & Threat Intelligence**: Added backend aggregators `get_mitre_stats()`, `get_indicators_stats()`, and `get_intelligence_stats()` to parse database records and populate dashboard heatmaps dynamically.

### Fixed
- Fixed SQLAlchemy Pydantic V2 `from_attributes` compatibility.
- Fixed FastAPI JSON encoder serialization for database commit payloads.
- Fixed event loop scheduling error when broadcasting WebSockets from threadpool-executed sync endpoints using `asyncio.run_coroutine_threadsafe`.

### Changed
- Standardized UI components across Dashboard Home, Threat Intelligence, and MITRE Heatmap to consume live REST endpoints and WebSocket events.
- Updated `README.md`, `PROJECT_STATUS.md`, and system setup guides.
