"""
Gatilho de Treinamento - Modelo V1 (Base)
==========================================

Script minimalista que aciona o motor de treinamento
com as configurações específicas do Modelo V1.

Características do V1:
- Dados: Loan_default.csv (sem score_bureau)
- Features: Apenas dados básicos do contrato
- Schema: ContractFeaturesV1
"""

from model_trainer import train_model
from models.schemas import ContractFeaturesV1

if __name__ == "__main__":
    train_model(
        schema_class=ContractFeaturesV1,
        data_path='data/Loan_default.csv',
        model_output_path='artifacts/risk_model_pipeline_v1.joblib',
        x_test_output_path='artifacts/X_test_v1.csv',
        y_test_output_path='artifacts/y_test_v1.csv',
        model_version='V1'
    )
