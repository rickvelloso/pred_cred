import os

API_TITLE = "API Preditiva de Risco Imobiliário (PredCred)"
API_DESCRIPTION = "Microserviço de IA para simular a análise de risco de inadimplência de inquilinos."
API_VERSION = "0.2.0"

DEFAULT_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

MODEL_VERSIONS = {
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

RISK_THRESHOLDS = {
    'high': 0.75,
    'medium': 0.50
}

OPTIMIZATION_CONFIG = {
    'min_threshold': 0.01,
    'max_threshold': 1.00,
    'num_points': 100
}

DEFAULT_BUSINESS_PARAMS = {
    'loss_per_fn': 5000,
    'profit_per_fp': 800
}


def get_cors_origins():
    """Get CORS origins from environment or use defaults."""
    origins_env = os.getenv("ALLOWED_ORIGINS")
    
    if origins_env:
        origins = [origin.strip() for origin in origins_env.split(",")]
        print(f"[INFO] CORS configurado para origens do ambiente: {origins}")
        return origins
    
    print(f"[INFO] CORS configurado para origens padrão (locais): {DEFAULT_ORIGINS}")
    return DEFAULT_ORIGINS
