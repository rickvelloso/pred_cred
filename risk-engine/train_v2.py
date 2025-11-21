"""
Gatilho de Treinamento - Modelo V2 (Enriquecido)
=================================================

Script minimalista que aciona o motor de treinamento
com as configurações específicas do Modelo V2.

Características do V2:
- Dados: Loan_default_ENRICHED.csv (com score_bureau)
- Features: Dados básicos + score de bureau de crédito
- Schema: ContractFeaturesV2
"""

from model_trainer import train_model
from models.schemas import ContractFeaturesV2

if __name__ == "__main__":
    train_model(
        schema_class=ContractFeaturesV2,
        data_path='data/Loan_default_ENRICHED.csv',
        model_output_path='artifacts/risk_model_pipeline_v2.joblib',
        x_test_output_path='artifacts/X_test_v2.csv',
        y_test_output_path='artifacts/y_test_v2.csv',
        model_version='V2'
    )
