from fastapi import APIRouter

router = APIRouter(tags=["Health Check"])


@router.get("/")
async def health_check():
    """Check if API is online."""
    return {"status": "API de Risco Imobiliário está online e operacional."}
