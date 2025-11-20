from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
from typing import Literal, Dict, Tuple
from schema import ContractFeaturesV1, ContractFeaturesV2
from sklearn.metrics import confusion_matrix, classification_report
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API Preditiva de Risco Imobiliário (PredCred)",
    description="Microserviço de IA para simular a análise de risco de inadimplência de inquilinos.",
    version="0.2.0"
)

default_origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

origins_env = os.getenv("ALLOWED_ORIGINS")

if origins_env:
    origins = [origin.strip() for origin in origins_env.split(",")]
    print(f"[INFO] CORS configurado para origens do ambiente: {origins}")
else:
    origins = default_origins
    print(f"[INFO] CORS configurado para origens padrão (locais): {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dicionários para armazenar múltiplos modelos
models: Dict[str, object] = {}
test_data: Dict[str, Tuple[pd.DataFrame, pd.Series]] = {}

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

@app.on_event("startup")
async def startup_event():
    """Carrega todos os modelos (V1 e V2) e seus dados de teste."""
    global models, test_data
    
    print("\n" + "="*60)
    print("INICIALIZANDO API - CARREGANDO MODELOS")
    print("="*60 + "\n")
    
    # Configuração dos artefatos para cada versão
    versions = {
        'v1': {
            'model_path': 'artifacts/risk_model_pipeline_v1.joblib',
            'x_test_path': 'artifacts/X_test_v1.csv',
            'y_test_path': 'artifacts/y_test_v1.csv'
        },
        'v2': {
            'model_path': 'artifacts/risk_model_pipeline_v2.joblib',
            'x_test_path': 'artifacts/X_test_v2.csv',
            'y_test_path': 'artifacts/y_test_v2.csv'
        }
    }
    
    # Carregar cada versão
    for version, paths in versions.items():
        print(f"[{version.upper()}] Carregando artefatos...")
        
        # Carregar modelo
        try:
            model = joblib.load(paths['model_path'])
            models[version] = model
            print(f"  ✓ Modelo carregado: {paths['model_path']}")
        except FileNotFoundError:
            print(f"  ✗ ERRO: Modelo não encontrado: {paths['model_path']}")
            models[version] = None
        except Exception as e:
            print(f"  ✗ ERRO ao carregar modelo: {e}")
            models[version] = None
        
        # Carregar dados de teste
        try:
            X_test = pd.read_csv(paths['x_test_path'])
            y_test_df = pd.read_csv(paths['y_test_path'])
            y_test = y_test_df.squeeze()
            test_data[version] = (X_test, y_test)
            print(f"  ✓ Dados de teste carregados: {len(X_test)} amostras")
        except FileNotFoundError:
            print(f"  ✗ ERRO: Dados de teste não encontrados")
            test_data[version] = (None, None)
        except Exception as e:
            print(f"  ✗ ERRO ao carregar dados de teste: {e}")
            test_data[version] = (None, None)
        
        print()
    
    # Resumo final
    print("="*60)
    models_loaded = sum(1 for m in models.values() if m is not None)
    print(f"✅ Modelos carregados: {models_loaded}/2")
    
    if models_loaded == 0:
        print("⚠️  AVISO: Nenhum modelo carregado. Endpoints falharão.")
    elif models_loaded < 2:
        print("⚠️  AVISO: Alguns modelos faltando. Funcionalidade parcial.")
    else:
        print("✅ Todos os modelos carregados com sucesso!")
    
    print("="*60 + "\n")

@app.get("/", tags=["Health Check"])
async def read_root():
    """Verifica se a API está online."""
    return {"status": "API de Risco Imobiliário está online e operacional."}

@app.post("/score/v1", response_model=ScoreResponse, tags=["Scoring (1. Individual)"])
async def get_risk_score_v1(features: ContractFeaturesV1):
    """
    **Modelo V1 (Base)** - Recebe dados básicos do contrato e retorna o score de risco.
    
    Este modelo usa apenas features básicas, sem dados externos de bureau.
    """
    model = models.get('v1')
    
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo V1 não carregado. Verifique os logs do servidor."
        )

    input_data = pd.DataFrame([features.model_dump()])

    try:
        probabilities = model.predict_proba(input_data)
        prob_low_risk = float(probabilities[0][0])
        prob_high_risk = float(probabilities[0][1])
        prediction = int(model.predict(input_data)[0])

        recommendation = ""
        if prob_high_risk > 0.75:
            recommendation = "Recusa Automática (Risco > 75%)"
        elif prob_high_risk > 0.50:
            recommendation = "Análise Manual (Risco > 50%)"
        else:
            recommendation = "Aprovação Automática (Risco < 50%)"

        return {
            "prediction_label": prediction,
            "probability_high_risk": prob_high_risk,
            "probability_low_risk": prob_low_risk,
            "business_recommendation": recommendation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno durante a predição: {str(e)}")


@app.post("/score/v2", response_model=ScoreResponse, tags=["Scoring (1. Individual)"])
async def get_risk_score_v2(features: ContractFeaturesV2):
    """
    **Modelo V2 (Enriquecido)** - Recebe dados do contrato + score de bureau e retorna o score de risco.
    
    Este modelo usa features básicas + score_bureau (dados externos simulados).
    Geralmente oferece maior precisão por ter mais informações.
    """
    model = models.get('v2')
    
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo V2 não carregado. Verifique os logs do servidor."
        )

    input_data = pd.DataFrame([features.model_dump()])

    try:
        probabilities = model.predict_proba(input_data)
        prob_low_risk = float(probabilities[0][0])
        prob_high_risk = float(probabilities[0][1])
        prediction = int(model.predict(input_data)[0])

        recommendation = ""
        if prob_high_risk > 0.75:
            recommendation = "Recusa Automática (Risco > 75%)"
        elif prob_high_risk > 0.50:
            recommendation = "Análise Manual (Risco > 50%)"
        else:
            recommendation = "Aprovação Automática (Risco < 50%)"

        return {
            "prediction_label": prediction,
            "probability_high_risk": prob_high_risk,
            "probability_low_risk": prob_low_risk,
            "business_recommendation": recommendation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno durante a predição: {str(e)}")

@app.get("/evaluate_threshold", response_model=ThresholdEvaluationResponse, tags=["Scoring (2. Simulador de Negócio)"])
async def evaluate_threshold(
    threshold: float = Query(default=0.5, ge=0.0, le=1.0, description="Ponto de corte (0.0 a 1.0) para classificar como Risco Alto (1)"),
    model_version: str = Query(default="v2", description="Versão do modelo: 'v1' ou 'v2'")
):
    """
    Simula o impacto de um ponto de corte (threshold) de risco em
    TODO o conjunto de dados de teste.
    
    - **Erro de Prejuízo (FN)**: Quantos clientes ruins foram aprovados.
    - **Erro de Atrito (FP)**: Quantos clientes bons foram recusados.
    - **model_version**: Escolha entre 'v1' (modelo base) ou 'v2' (modelo enriquecido)
    """
    # Validar versão do modelo
    if model_version not in models:
        raise HTTPException(
            status_code=400, 
            detail=f"Versão '{model_version}' inválida. Use 'v1' ou 'v2'."
        )
    
    # Obter modelo e dados de teste da versão selecionada
    model = models.get(model_version)
    X_test, y_test = test_data.get(model_version, (None, None))
    
    if model is None or X_test is None or y_test is None:
        raise HTTPException(
            status_code=503, 
            detail=f"Modelo {model_version} não carregado. Verifique os logs do servidor."
        )

    try:
        probabilities = model.predict_proba(X_test)[:, 1]
        
        y_pred_new = np.where(probabilities > threshold, 1, 0)
        
        cm = confusion_matrix(y_test, y_pred_new)
        
        tn, fp, fn, tp = cm.ravel()
        
        report = classification_report(y_test, y_pred_new, output_dict=True)
        
        matrix_details = {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        }
        
        business_details = {
            "total_test_samples": len(y_test),
            "erro_de_prejuizo_count": int(fn),
            "erro_de_atrito_count": int(fp)
        }

        return {
            "threshold_usado": threshold,
            "matriz_confusao": matrix_details,
            "metricas_de_negocio": business_details,
            "classification_report": report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro durante a avaliação: {str(e)}")

@app.get("/optimize", response_model=OptimizationResponse, tags=["Scoring (3. Otimizador)"])
async def optimize_threshold(
    loss_per_fn: float = Query(default=5000, ge=0, description="Prejuízo médio por cliente ruim aprovado (R$)"),
    profit_per_fp: float = Query(default=800, ge=0, description="Lucro médio perdido por cliente bom recusado (R$)"),
    model_version: str = Query(default="v2", description="Versão do modelo: 'v1' ou 'v2'")
):
    """
    **Otimizador de Threshold** - Calcula o threshold ótimo que minimiza o custo total de erro.
    
    Testa 100 valores de threshold (0.01 a 1.00) e retorna:
    - O threshold que minimiza: (FN × loss_per_fn) + (FP × profit_per_fp)
    - Todos os pontos testados para visualização no frontend
    
    Parâmetros de negócio:
    - **loss_per_fn**: Prejuízo médio quando um cliente ruim é aprovado (default: R$ 5.000)
    - **profit_per_fp**: Lucro perdido quando um cliente bom é recusado (default: R$ 800)
    - **model_version**: 'v1' (base) ou 'v2' (enriquecido)
    """
    # Validar versão do modelo
    if model_version not in models:
        raise HTTPException(
            status_code=400, 
            detail=f"Versão '{model_version}' inválida. Use 'v1' ou 'v2'."
        )
    
    # Obter modelo e dados de teste
    model = models.get(model_version)
    X_test, y_test = test_data.get(model_version, (None, None))
    
    if model is None or X_test is None or y_test is None:
        raise HTTPException(
            status_code=503, 
            detail=f"Modelo {model_version} não carregado. Verifique os logs do servidor."
        )
    
    try:
        # Calcular probabilidades uma vez
        probabilities = model.predict_proba(X_test)[:, 1]
        
        # Testar 100 thresholds de 0.01 a 1.00
        thresholds = np.linspace(0.01, 1.00, 100)
        results = []
        
        min_cost = float('inf')
        optimal_threshold = 0.5
        optimal_fn = 0
        optimal_fp = 0
        
        for threshold in thresholds:
            # Predições com este threshold
            y_pred = np.where(probabilities > threshold, 1, 0)
            
            # Matriz de confusão
            cm = confusion_matrix(y_test, y_pred)
            tn, fp, fn, tp = cm.ravel()
            
            # Custo total
            total_cost = (fn * loss_per_fn) + (fp * profit_per_fp)
            
            # Armazenar ponto
            results.append(ThresholdPoint(
                threshold=float(threshold),
                fn_count=int(fn),
                fp_count=int(fp),
                total_cost=float(total_cost)
            ))
            
            # Atualizar ótimo se encontrou custo menor
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
        raise HTTPException(status_code=500, detail=f"Erro durante otimização: {str(e)}")