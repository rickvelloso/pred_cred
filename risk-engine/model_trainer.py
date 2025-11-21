"""
Motor de Treinamento Reutilizável (DRY Pattern)
================================================

Este módulo contém toda a lógica de treinamento de modelos,
eliminando duplicação de código entre train_v1.py e train_v2.py.

Uso:
    from model_trainer import train_model
    from schema import ContractFeaturesV1
    
    train_model(
        schema_class=ContractFeaturesV1,
        data_path='data/Loan_default.csv',
        model_output_path='artifacts/risk_model_pipeline_v1.joblib',
        x_test_output_path='artifacts/X_test_v1.csv',
        y_test_output_path='artifacts/y_test_v1.csv'
    )
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from imblearn.pipeline import Pipeline as ImblearnPipeline
from imblearn.over_sampling import SMOTE
import joblib
from typing import Type
from pydantic import BaseModel


def train_model(
    schema_class: Type[BaseModel],
    data_path: str,
    model_output_path: str,
    x_test_output_path: str,
    y_test_output_path: str,
    model_version: str = "V1"
):
    """
    Motor de treinamento unificado para todos os modelos.
    
    Args:
        schema_class: Classe Pydantic que define as features (ex: ContractFeaturesV1)
        data_path: Caminho do CSV de entrada
        model_output_path: Caminho para salvar o modelo treinado (.joblib)
        x_test_output_path: Caminho para salvar X_test (.csv)
        y_test_output_path: Caminho para salvar y_test (.csv)
        model_version: String identificadora da versão (para logs)
    """
    
    print(f"\n{'='*60}")
    print(f"Iniciando Treinamento - Modelo {model_version}")
    print(f"{'='*60}\n")
    
    # 1. Extração de features do schema
    print("[1/7] Extraindo features do schema...")
    fields = schema_class.model_fields
    
    numeric_features = []
    categorical_features = []
    
    for field_name, field_info in fields.items():
        field_type = field_info.annotation
        
        if field_type is int or field_type is float:
            numeric_features.append(field_name)
        else:
            categorical_features.append(field_name)
    
    print(f"  ✓ Features numéricas: {len(numeric_features)}")
    print(f"  ✓ Features categóricas: {len(categorical_features)}")
    
    # 2. Carregamento dos dados
    print(f"\n[2/7] Carregando dados de: {data_path}")
    try:
        data = pd.read_csv(data_path)
        print(f"  ✓ {len(data)} registros carregados")
    except FileNotFoundError:
        print(f"  ✗ ERRO: Arquivo '{data_path}' não encontrado.")
        raise
    
    # 3. Preparação dos dados
    print("\n[3/7] Preparando dados...")
    TARGET = 'Default'
    
    if 'LoanID' in data.columns:
        data = data.drop('LoanID', axis=1)
    
    data = data.dropna(subset=[TARGET])
    
    all_features = numeric_features + categorical_features
    X = data[all_features]
    y = data[TARGET]
    
    print(f"  ✓ Target: {TARGET}")
    print(f"  ✓ Features totais: {len(all_features)}")
    
    # 4. Split train/test
    print("\n[4/7] Dividindo dados (70% treino / 30% teste)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    print(f"  ✓ Treino: {len(X_train)} amostras")
    print(f"  ✓ Teste: {len(X_test)} amostras")
    
    # 5. Construção do pipeline
    print("\n[5/7] Construindo pipeline de ML...")
    
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough'
    )
    
    model_pipeline = ImblearnPipeline(steps=[
        ('preprocessor', preprocessor),
        ('sampler', SMOTE(random_state=42)),
        ('classifier', LogisticRegression(random_state=42, max_iter=1000))
    ])
    
    print("  ✓ Pipeline: StandardScaler + OneHotEncoder + SMOTE + LogisticRegression")
    
    # 6. Treinamento
    print("\n[6/7] Treinando modelo...")
    model_pipeline.fit(X_train, y_train)
    print("  ✓ Treinamento concluído")
    
    # 7. Salvamento de artefatos
    print("\n[7/7] Salvando artefatos...")
    
    # Salvar modelo
    joblib.dump(model_pipeline, model_output_path)
    print(f"  ✓ Modelo salvo: {model_output_path}")
    
    # Salvar dados de teste
    try:
        X_test.to_csv(x_test_output_path, index=False)
        y_test.to_csv(y_test_output_path, index=False)
        print(f"  ✓ X_test salvo: {x_test_output_path}")
        print(f"  ✓ y_test salvo: {y_test_output_path}")
    except Exception as e:
        print(f"  ✗ Erro ao salvar dados de teste: {e}")
    
    # 8. Validação e métricas
    print(f"\n{'='*60}")
    print("VALIDAÇÃO DO MODELO")
    print(f"{'='*60}\n")
    
    y_pred = model_pipeline.predict(X_test)
    y_prob = model_pipeline.predict_proba(X_test)[:, 1]
    
    print("Matriz de Confusão:")
    print("  [[TN (Bom/Bom)      FP (Bom/Ruim - Atrito)]")
    print("   [FN (Ruim/Bom - Perda) TP (Ruim/Ruim)]]")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nRelatório de Classificação:")
    print(classification_report(y_test, y_pred))
    
    print("\nAnálise de Probabilidades:")
    print(f"  Média: {y_prob.mean():.4f}")
    print(f"  Mínimo: {y_prob.min():.4f}")
    print(f"  Máximo: {y_prob.max():.4f}")
    
    print(f"\n{'='*60}")
    print(f"✅ Modelo {model_version} treinado com sucesso!")
    print(f"{'='*60}\n")
    
    return model_pipeline, X_test, y_test
