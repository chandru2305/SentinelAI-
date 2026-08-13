# Module 13 — Threat Intelligence + MITRE ATT&CK

## Backend
- **MITRE Aggregation**: Created `get_mitre_stats()` in SQLAlchemyThreatRepository and exposed via `GET /api/v1/threats/mitre`. Aggregates all tactic/technique counts and details directly from database records.
- **Threat Intelligence API**: Exposes categories, severity distribution, top mapped techniques, and indicator statistics under `GET /api/v1/threats/intelligence`.
- **Indicator Aggregation**: Tracks first seen, last seen, detection counts, and categories for all indicators (payloads, URLs, IPs) in the database via `GET /api/v1/threats/indicators`.
- **Threat Statistics**: Reused the database-backed endpoint `GET /api/v1/threats/stats` to display real scan telemetry.

## Frontend
- **MITRE Visualization**: Replaced hardcoded values in `MitreAttackCoverage.tsx` with dynamic API data.
- **Threat Intelligence**: Replaced static/mock values in the dashboard widget and full page with live, data-driven telemetry. Added a list of recently extracted IOCs.
- **Statistics**: Reused the data-driven stats cards in the `ThreatStatistics` page.
- **Empty/Loading/Error States**: Graceful states are shown for empty results, loading delays, and request errors in MITRE, Threat Intelligence, and statistics sections.

## Real-Time Integration
- **WebSocket Updates**: Bounded the WebSocket `lastEvent` prop to the MITRE heatmap, Threat Intelligence page, and IOC feed. Detections and IOC counters increment automatically when new threat events are broadcast.
- **Duplicate Prevention**: Used `useRef` and `feed.some` arrays on state updates to prevent duplicate telemetry counts.

## Security
- **JWT Protection**: Secured all endpoints with FastAPI's `get_current_user` dependency, ensuring all requests return `401 Unauthorized` for invalid or missing tokens.

## Tests

| Test | Result |
|---|---|
| Backend imports | PASS |
| Backend startup | PASS |
| MITRE aggregation | PASS |
| Threat intelligence | PASS |
| Indicator aggregation | PASS |
| Statistics | PASS |
| Authentication | PASS |
| WebSocket regression | PASS |
| Integration test | PASS |
| npm build | PASS |

## Files Modified
- `backend/app/threats/repository.py`
- `backend/app/threats/service.py`
- `backend/app/threats/router.py`
- `frontend/src/services/threatService.ts`
- `frontend/src/components/mitre/MitreAttackCoverage.tsx`
- `frontend/src/components/intel/ThreatIntelligence.tsx`
- `frontend/src/pages/Detection/ThreatIntelligence.tsx`
- `frontend/src/pages/Dashboard/DashboardHome.tsx`

## Remaining Issues
- None.
