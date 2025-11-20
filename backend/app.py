from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import API_TITLE, API_DESCRIPTION, API_VERSION, get_cors_origins
from core.model_loader import model_loader
from api.routes import health, scoring, threshold


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title=API_TITLE,
        description=API_DESCRIPTION,
        version=API_VERSION
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(health.router)
    app.include_router(scoring.router)
    app.include_router(threshold.router)
    
    @app.on_event("startup")
    async def startup_event():
        """Load all models on startup."""
        model_loader.load_all_models()
    
    return app


app = create_app()
