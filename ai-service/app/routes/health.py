import time

from fastapi import APIRouter

router = APIRouter()

_start_time = time.time()


@router.get("/health")
def get_health():
    return {
        "success": True,
        "message": "AI service is healthy",
        "data": {
            "service": "smart-crop-advisory-ai-service",
            "status": "ok",
            "uptimeSeconds": round(time.time() - _start_time, 3),
        },
    }
