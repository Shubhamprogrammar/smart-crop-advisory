# Smart Crop Advisory System

AI-powered crop advisory platform for small and marginal farmers — combining soil, weather, crop, disease, and market data with rules + ML + LLM guidance to answer one question every day: **"What should this farmer do today, and why?"**

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts, TanStack Query, Zustand, Leaflet
- **Backend**: Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, Redis, BullMQ
- **AI Service**: Python, FastAPI, Hugging Face, PyTorch/scikit-learn, OpenCV, RAG
- **Storage**: Cloudinary
- **Deployment**: Vercel (frontend), Render/DigitalOcean/AWS (backend + AI), MongoDB Atlas, Redis Cloud

See [docs/blueprint.md](docs/blueprint.md) for full architecture, and [smart-crop-advisory-master-prompt.md](smart-crop-advisory-master-prompt.md) for the original project specification.

## Project Structure

```
smart-crop-advisory/
├── frontend/     # Next.js app
├── backend/      # Node.js + Express API
├── ai-service/   # Python + FastAPI AI/ML service
├── docs/         # Architecture docs, API docs, deployment guide
└── docker-compose.yml
```

## Getting Started

Each service has its own README with setup instructions:

- [frontend/README.md](frontend/README.md)
- [backend/README.md](backend/README.md)
- [ai-service/README.md](ai-service/README.md)

## Development Status

Built incrementally, phase by phase. See [docs/blueprint.md](docs/blueprint.md) §19 for the full phase list and current progress in the commit history.

## License

Hackathon project — license TBD.
