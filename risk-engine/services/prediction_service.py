import pandas as pd
import numpy as np
from typing import Tuple
from fastapi import HTTPException
from sklearn.metrics import confusion_matrix, classification_report

from core.model_loader import model_loader
from core.business_rules import get_business_recommendation
from models.responses import (
    ScoreResponse,
    ThresholdEvaluationResponse,
    ConfusionMatrixDetails,
    BusinessMetrics,
    OptimizationResponse,
    ThresholdPoint
)
from config.settings import OPTIMIZATION_CONFIG


class PredictionService:
    """Service for making predictions with ML models."""
    
    @staticmethod
    def predict_risk(features: pd.DataFrame, model_version: str) -> ScoreResponse:
        """
        Predict risk score for given features.
        
        Args:
            features: Input features as DataFrame
            model_version: Model version to use ('v1' or 'v2')
        
        Returns:
            ScoreResponse with prediction and recommendation
        
        Raises:
            HTTPException: If model not loaded or prediction fails
        """
        model = model_loader.get_model(model_version)
        
        if model is None:
            raise HTTPException(
                status_code=503,
                detail=f"Modelo {model_version} não carregado. Verifique os logs do servidor."
            )
        
        try:
            probabilities = model.predict_proba(features)
            prob_low_risk = float(probabilities[0][0])
            prob_high_risk = float(probabilities[0][1])
            prediction = int(model.predict(features)[0])
            
            recommendation = get_business_recommendation(prob_high_risk)
            
            return ScoreResponse(
                prediction_label=prediction,
                probability_high_risk=prob_high_risk,
                probability_low_risk=prob_low_risk,
                business_recommendation=recommendation
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro interno durante a predição: {str(e)}"
            )


class ThresholdService:
    """Service for threshold evaluation and optimization."""
    
    @staticmethod
    def evaluate_threshold(threshold: float, model_version: str) -> ThresholdEvaluationResponse:
        """
        Evaluate model performance at a specific threshold.
        
        Args:
            threshold: Classification threshold (0-1)
            model_version: Model version to use
        
        Returns:
            ThresholdEvaluationResponse with metrics
        
        Raises:
            HTTPException: If model not loaded or evaluation fails
        """
        model = model_loader.get_model(model_version)
        X_test, y_test = model_loader.get_test_data(model_version)
        
        if model is None or X_test is None or y_test is None:
            raise HTTPException(
                status_code=503,
                detail=f"Modelo {model_version} não carregado. Verifique os logs do servidor."
            )
        
        try:
            probabilities = model.predict_proba(X_test)[:, 1]
            y_pred = np.where(probabilities > threshold, 1, 0)
            
            cm = confusion_matrix(y_test, y_pred)
            tn, fp, fn, tp = cm.ravel()
            
            report = classification_report(y_test, y_pred, output_dict=True)
            
            return ThresholdEvaluationResponse(
                threshold_usado=threshold,
                matriz_confusao=ConfusionMatrixDetails(
                    true_negatives=int(tn),
                    false_positives=int(fp),
                    false_negatives=int(fn),
                    true_positives=int(tp)
                ),
                metricas_de_negocio=BusinessMetrics(
                    total_test_samples=len(y_test),
                    erro_de_prejuizo_count=int(fn),
                    erro_de_atrito_count=int(fp)
                ),
                classification_report=report
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro durante a avaliação: {str(e)}"
            )
    
    @staticmethod
    def optimize_threshold(
        loss_per_fn: float,
        profit_per_fp: float,
        model_version: str
    ) -> OptimizationResponse:
        """
        Find optimal threshold that minimizes total cost.
        
        Args:
            loss_per_fn: Cost of false negative (approving bad client)
            profit_per_fp: Cost of false positive (rejecting good client)
            model_version: Model version to use
        
        Returns:
            OptimizationResponse with optimal threshold and all evaluated points
        
        Raises:
            HTTPException: If model not loaded or optimization fails
        """
        model = model_loader.get_model(model_version)
        X_test, y_test = model_loader.get_test_data(model_version)
        
        if model is None or X_test is None or y_test is None:
            raise HTTPException(
                status_code=503,
                detail=f"Modelo {model_version} não carregado. Verifique os logs do servidor."
            )
        
        try:
            probabilities = model.predict_proba(X_test)[:, 1]
            thresholds = np.linspace(
                OPTIMIZATION_CONFIG['min_threshold'],
                OPTIMIZATION_CONFIG['max_threshold'],
                OPTIMIZATION_CONFIG['num_points']
            )
            
            results = []
            min_cost = float('inf')
            optimal_threshold = 0.5
            optimal_fn = 0
            optimal_fp = 0
            
            for threshold in thresholds:
                y_pred = np.where(probabilities > threshold, 1, 0)
                cm = confusion_matrix(y_test, y_pred)
                tn, fp, fn, tp = cm.ravel()
                
                total_cost = (fn * loss_per_fn) + (fp * profit_per_fp)
                
                results.append(ThresholdPoint(
                    threshold=float(threshold),
                    fn_count=int(fn),
                    fp_count=int(fp),
                    total_cost=float(total_cost)
                ))
                
                if total_cost < min_cost:
                    min_cost = total_cost
                    optimal_threshold = float(threshold)
                    optimal_fn = int(fn)
                    optimal_fp = int(fp)
            
            return OptimizationResponse(
                optimal_threshold=optimal_threshold,
                min_total_cost=float(min_cost),
                fn_at_optimal=optimal_fn,
                fp_at_optimal=optimal_fp,
                all_points=results
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro durante otimização: {str(e)}"
            )
