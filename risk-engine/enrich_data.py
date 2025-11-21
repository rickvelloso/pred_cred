"""
Script de Enriquecimento de Dados com Simulação de Bureau de Crédito
=====================================================================

Este script enriquece os dados base de crédito com scores simulados de bureau,
criando dados mais realistas para treinar o Modelo V2.

Lógica de Simulação com Ruído Realista:
- Clientes inadimplentes (Default=1): Distribuição normal centrada em 450 (σ=100)
- Clientes adimplentes (Default=0): Distribuição normal centrada em 750 (σ=100)
- Sobreposição intencional entre distribuições para simular cenário real
- ~15-20% de sobreposição para manter trade-offs no threshold simulator
"""

import pandas as pd
import numpy as np


INPUT_PATH = 'data/Loan_default.csv'
OUTPUT_PATH = 'data/Loan_default_ENRICHED.csv'


def generate_bureau_score(default_status):
    """
    Gera um score de bureau simulado com ruído realista baseado no status de inadimplência.
    
    Usa distribuições normais com sobreposição para simular imperfeições do mundo real,
    onde nem todos os inadimplentes têm scores baixos e nem todos os adimplentes têm scores altos.
    
    Args:
        default_status (int): 1 para inadimplente, 0 para adimplente
        
    Returns:
        int: Score de bureau simulado entre 300 e 950
    """
    if default_status == 1:
        # Cliente inadimplente: distribuição normal centrada em 450
        # Permite alguns inadimplentes com scores médios/altos (ruído realista)
        score = np.random.normal(loc=450, scale=100)
    else:
        # Cliente adimplente: distribuição normal centrada em 750
        # Permite alguns adimplentes com scores médios/baixos (ruído realista)
        score = np.random.normal(loc=750, scale=100)
    
    # Limita o score entre 300 e 950 (bounds do bureau de crédito)
    score = np.clip(score, 300, 950)
    
    return int(score)


def main():
    """Função principal de enriquecimento de dados."""
    print(f"[INFO] Carregando dados de: {INPUT_PATH}")
    
    df = pd.read_csv(INPUT_PATH)
    print(f"[INFO] {len(df)} registros carregados")
    
    np.random.seed(42)
    
    print("[INFO] Gerando scores de bureau simulados...")
    df['score_bureau'] = df['Default'].apply(generate_bureau_score)
    
    print(f"[INFO] Salvando dados enriquecidos em: {OUTPUT_PATH}")
    df.to_csv(OUTPUT_PATH, index=False)
    
    print("[SUCCESS] ✅ Dados enriquecidos com sucesso!")
    print(f"[INFO] Nova coluna 'score_bureau' adicionada")
    print(f"[INFO] Estatísticas do score_bureau:")
    print(df['score_bureau'].describe())
    
    print(f"\n[INFO] Distribuição por status de Default:")
    print(df.groupby('Default')['score_bureau'].describe())


if __name__ == "__main__":
    main()
