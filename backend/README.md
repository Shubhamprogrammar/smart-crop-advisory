# Backend — Smart Crop Advisory System

Node.js + Express + TypeScript API. System of record and orchestrator: owns MongoDB, Redis, BullMQ, authentication, and all farmer-facing business logic. Delegates ML/CV/OCR/RAG inference to the `ai-service`.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

Server starts on `http://localhost:5000` by default. Health check: `GET /health`.

## Scripts

- `npm run dev` — start with hot reload (tsx watch)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled build
- `npm test` — run Jest test suite
- `npm run lint` — lint source

## Structure

```
src/
├── controllers/   # request handlers
├── routes/        # Express routers, mounted under /api
├── models/        # Mongoose schemas
├── services/      # business logic, external integrations
├── middlewares/    # auth, role, error, rate limiting, validation
├── utils/         # logger, ApiError, response helpers
├── config/        # env loading/validation
├── validators/    # request schema validation
├── jobs/          # BullMQ queues + workers
├── app.ts         # Express app assembly
└── server.ts      # entry point
```

See [../docs/blueprint.md](../docs/blueprint.md) for full architecture.
