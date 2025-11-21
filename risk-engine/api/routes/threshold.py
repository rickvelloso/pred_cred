from fastapi import APIRouter, Query, HTTPException

from models.responses import ThresholdEvaluationResponse, OptimizationResponse
from services.prediction_service import ThresholdService
from config.settings import DEFAULT_BUSINESS_PARAMS, MODEL_VERSIONS

router = APIRouter(tags=["Scoring (2. Simulator & Optimizer)"])


@router.get("/evaluate_threshold", response_model=ThresholdEvaluationResponse)
async def evaluate_threshold(
    threshold: float = Query(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Classification threshold (0.0 to 1.0) for High Risk (1)"
    ),
    model_version: str = Query(
        default="v2",
        description="Model version: 'v1' or 'v2'"
    )
):
    """
    Simulate the impact of a risk threshold on the entire test dataset.
    
    - **Erro de Prejuízo (FN)**: How many bad clients were approved
    - **Erro de Atrito (FP)**: How many good clients were rejected
    - **model_version**: Choose between 'v1' (base model) or 'v2' (enriched model)
    """
    if model_version not in MODEL_VERSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid version '{model_version}'. Use 'v1' or 'v2'."
        )
    
    return ThresholdService.evaluate_threshold(threshold, model_version)


@router.get("/optimize", response_model=OptimizationResponse)
async def optimize_threshold(
    loss_per_fn: float = Query(
        default=DEFAULT_BUSINESS_PARAMS['loss_per_fn'],
        ge=0,
        description="Average loss per bad client approved (R$)"
    ),
    profit_per_fp: float = Query(
        default=DEFAULT_BUSINESS_PARAMS['profit_per_fp'],
        ge=0,
        description="Average profit lost per good client rejected (R$)"
    ),
    model_version: str = Query(
        default="v2",
        description="Model version: 'v1' or 'v2'"
    )
):
    """
    **Threshold Optimizer** - Calculate optimal threshold that minimizes total error cost.
    
    Tests 100 threshold values (0.01 to 1.00) and returns:
    - The threshold that minimizes: (FN × loss_per_fn) + (FP × profit_per_fp)
    - All tested points for frontend visualization
    
    Business parameters:
    - **loss_per_fn**: Average loss when a bad client is approved (default: R$ 5,000)
    - **profit_per_fp**: Lost profit when a good client is rejected (default: R$ 800)
    - **model_version**: 'v1' (base) or 'v2' (enriched)
    """
    if model_version not in MODEL_VERSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid version '{model_version}'. Use 'v1' or 'v2'."
        )
    
    return ThresholdService.optimize_threshold(loss_per_fn, profit_per_fp, model_version)
