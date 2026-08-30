# AI Service — Smart Crop Advisory System

Python + FastAPI microservice for ML/CV/OCR/RAG inference. Stateless — receives data from the Node.js backend in the request and returns predictions; never talks to MongoDB/Redis directly for application data.

## Setup

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`. Health check: `GET /health`. Interactive docs: `GET /docs`.

## Structure

```
app/
├── main.py       # FastAPI app assembly
├── config.py     # settings via pydantic-settings
├── routes/       # /ai/crop-recommendation, /ai/disease-detection, /ai/disease-risk,
│                 # /ai/soil-ocr, /ai/chat, /ai/embeddings, /health
├── services/     # business logic per capability
├── models/       # pydantic request/response schemas
├── ml/           # crop recommendation + disease detection models
├── rag/          # ingestion, retrieval, vector store
└── utils/
```

Heavy ML/CV/RAG dependencies (torch, transformers, scikit-learn, opencv, OCR, vector DB clients) are added to `requirements.txt` incrementally as each phase introduces them, rather than installed upfront.

See [../docs/blueprint.md](../docs/blueprint.md) for full architecture.
