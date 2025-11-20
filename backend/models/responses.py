from pydantic import BaseModel
from typing import Dict


class ScoreResponse(BaseModel):
    prediction_label: int
    probability_high_risk: float
    probability_low_risk: float
    business_recommendation: str


class ConfusionMatrixDetails(BaseModel):
    true_negatives: int
    false_positives: int
    false_negatives: int
    true_positives: int


class BusinessMetrics(BaseModel):
    total_test_samples: int
    erro_de_prejuizo_count: int
    erro_de_atrito_count: int
    

class ThresholdEvaluationResponse(BaseModel):
    threshold_usado: float
    matriz_confusao: ConfusionMatrixDetails
    metricas_de_negocio: BusinessMetrics
    classification_report: Dict


class ThresholdPoint(BaseModel):
    threshold: float
    fn_count: int
    fp_count: int
    total_cost: float


class OptimizationResponse(BaseModel):
    optimal_threshold: float
    min_total_cost: float
    fn_at_optimal: int
    fp_at_optimal: int
    all_points: list[ThresholdPoint]
