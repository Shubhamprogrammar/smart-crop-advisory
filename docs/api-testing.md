# API & Test Documentation

Smart Crop Advisory System — Phase 23 (Testing)

This document describes how to run the test suite in each service and what
it covers. It also documents the HTTP API conventions and the deterministic
endpoints that are covered by integration tests.

---

## 1. Running the tests

### Backend (Node.js + Express, Jest + Supertest)

```bash
cd backend
npm install
npm test            # runs jest (config: jest.config.js)
```

Requirements: a local MongoDB and Redis reachable at the defaults below.
The suite connects to a **dedicated test database** (`smart_crop_test`) and
uses the local Redis for caching/rate-limiting. It never touches real app
data.

```bash
# Optionally override test infra:
TEST_MONGO_URI=mongodb://127.0.0.1:27017/smart_crop_test npm test
TEST_REDIS_URL=redis://127.0.0.1:6379 npm test
```

Rate limiters are replaced with no-op middlewares during tests
(`tests/setupAfterEnv.ts`) so shared Redis windows can't cause flaky 429s.

### AI service (Python + FastAPI, pytest)

```bash
cd ai-service
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi pydantic pydantic-settings httpx pytest python-multipart
pytest            # config: pytest.ini
```

The runnable suite covers the **disease-risk rules engine** (unit +
sample-prediction + invalid-input, plus the `/ai/disease-risk` endpoint via
FastAPI TestClient). It deliberately avoids importing `app.main`, which
pulls in the heavy ML stack (torch/transformers/sklearn); the disease-risk
rules service is pure Python and needs none of that.

> The crop-recommendation and disease-detection services need the full ML
> dependency install (`pip install -r requirements.txt`, >500MB torch).
> Tests for the disease-risk module are included and runnable with the
> light install above; the heavier model services are exercised via the
> real API during manual/Docker validation (Phase 24).

### Frontend (Next.js, Jest)

```bash
cd frontend
npm install
npm test            # runs jest (config: jest.config.js)
```

Covers the "critical user flows" at the unit level: the auth store
(login/logout/status) and the API-envelope `unwrap` helper used by every
API call.

---

## 2. Test coverage summary

### Backend integration + unit (86 tests)

| Area | Route | Coverage |
|------|-------|----------|
| Auth | `/api/auth/register`, `/login`, `/me` | registration, duplicate email, validation, login by email/phone, bad credentials, missing/malformed token |
| Farm | `/api/farms` CRUD | create/list/get/update/delete, input validation, ownership isolation (404 for another user's farm), ZERO-trust cross-user checks |
| Soil | `/api/soil/:farmId` (manual), `/latest`, `/list` | manual entry + computed health score, validation (empty/out-of-range pH), ownership isolation |
| Weather | `/api/weather`, `/api/weather/farm/:farmId` | auth, missing coords, live fetch, farm scoping, ownership isolation |
| Crop recommendation | `/api/recommendations/crop|farm/:id` | auth, role gate (admin forbidden), validation, 404, listing |
| Disease detection & risk | `/api/diseases/:farmId`, `/risk/:farmId` | auth, role gate, required image, 404, no-active-cycle error, risk listing/isolation |
| Advisory | `/api/advisories/:farmId`, `/status` | listing, ownership isolation, role gate, status validation |
| Market | `/api/market/price|history|trend|nearby|recommendation` | auth, simulated+clearly-labeled prices, unknown-crop error, deterministic history, trend direction, nearest mandis, selling recommendation |
| Profit | `/api/profit/calculate` | arithmetic, per-acre/per-area fields, validation, labels estimates |
| Admin permissions | `/api/admin/stats|users|...` | role-based access (farmer/expert → 403, admin → 200) |
| Pure units | profitCalculator, soilHealth, weatherCodes, priceTrend, marketDataProvider | deterministic arithmetic/rule functions |

### AI service (15 tests)

- `tests/test_disease_risk.py` — unit + sample predictions + invalid inputs
  for the deterministic disease-risk rules engine.
- `tests/test_disease_risk_api.py` — `/ai/disease-risk` endpoint valid +
  invalid (pydantic 422) inputs via TestClient.

### Frontend (8 tests)

- `__tests__/authStore.test.ts` — login → authenticated, logout →
  unauthenticated, loading status.
- `__tests__/apiClient.test.ts` — success/failure envelopes, axios error
  mapping to `ApiRequestError`, non-axios error passthrough.

---

## 3. API conventions

All `/api/*` responses use this envelope (see `backend/src/utils/apiResponse.ts`):

```jsonc
// success
{ "success": true, "message": "...", "data": { ... } }
// failure
{ "success": false, "message": "...", "error": { ... } }
```

Status codes used by the suite:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation / bad request |
| `401` | Unauthenticated (missing/invalid token) |
| `403` | Forbidden (authenticated but wrong role) |
| `404` | Not found (or another user's resource — isolation) |
| `409` | Conflict (duplicate registration) |

Auth is carried via an `httpOnly` cookie (`scas_token`) set by auth routes;
APIs also accept an `Authorization: Bearer <token>` header. Both are
tested via Supertest.

---

## 4. Determinism & safety notes

- Market prices are **simulated demo data** and are explicitly labeled
  (`source: "simulated_demo"`, `isSimulated: true`, `disclaimer`). Tests
  assert these labels — the app never presents them as real data.
- The profit calculator always returns `isEstimate: true` and a disclaimer.
- Ownership isolation is enforced in the service layer and asserted by the
  tests (a farmer can never read/write another farmer's farm, soil,
  weather, market, or advisory data).
- The live-weather integration test calls Open-Meteo (no key required);
  both the success and stale-fallback paths are designed to keep the
  dashboard functional.
