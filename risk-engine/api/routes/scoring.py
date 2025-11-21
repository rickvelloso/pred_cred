import pandas as pd
from fastapi import APIRouter

from models.schemas import ContractFeaturesV1, ContractFeaturesV2
from models.responses import ScoreResponse
from services.prediction_service import PredictionService

router = APIRouter(prefix="/score", tags=["Scoring (1. Individual)"])


@router.post("/v1", response_model=ScoreResponse)
async def score_v1(features: ContractFeaturesV1):
    """
    **V1 Model (Base)** - Predict risk using basic contract features.
    
    This model uses only basic features without external bureau data.
    """
    input_data = pd.DataFrame([features.model_dump()])
    return PredictionService.predict_risk(input_data, 'v1')


@router.post("/v2", response_model=ScoreResponse)
async def score_v2(features: ContractFeaturesV2):
    """
    **V2 Model (Enriched)** - Predict risk using contract features + bureau score.
    
    This model uses basic features + score_bureau (simulated external data).
    Generally offers higher precision due to additional information.
    """
    input_data = pd.DataFrame([features.model_dump()])
    return PredictionService.predict_risk(input_data, 'v2')
