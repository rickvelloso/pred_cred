# 🏠 PredCred - Sistema Preditivo de Risco de Crédito

> [!NOTE]
> **Projeto de Portfólio**: Inspirado em um case técnico real da fintech **LocPay**, focado no desafio de prever risco de inadimplência em operações de crédito imobiliário. O **PredCred** é uma implementação completa demonstrando diagnóstico estratégico de dados e impacto de enriquecimento.

---

## 📊 O Problema de Negócio

A **PredCred** é uma fintech (fictícia) que oferece soluções de crédito imobiliário. Como qualquer instituição financeira, enfrenta um dilema crítico de decisão:

### O Dilema dos Dois Erros

| Tipo de Erro | Ação | Consequência | Impacto |
|--------------|------|--------------|---------|
| **Falso Negativo (FN)** | Aprovar cliente ruim | Inadimplência, default | **Prejuízo Direto** 💸 |
| **Falso Positivo (FP)** | Recusar cliente bom | Perda de receita | **Custo de Oportunidade** 📉 |

**Desafio**: Encontrar o equilíbrio ideal entre esses erros para maximizar o retorno do negócio.

---

## 🎯 A Tese do Projeto

> **O objetivo NÃO era atingir 99% de acurácia.**

### Propósito Central

**Diagnosticar a fraqueza dos dados de entrada** e demonstrar que, com as features disponíveis no dataset original, o **Modelo V1 representa um teto técnico com recall de ~69%**.

### Por que o Modelo V1 não pode melhorar significativamente?

O dataset original possui **limitações estruturais**:
- ❌ Poucos atributos discriminantes de risco
- ❌ Ausência de histórico de crédito detalhado  
- ❌ Falta de variáveis comportamentais
- ❌ Dados desbalanceados (8.896 defaults vs 67.709 não-defaults)

### A Solução de Negócio

**Não é otimizar o modelo. É enriquecer os dados.**

---

## 🔬 Comparação de Modelos - O Impacto do Enriquecimento

### Modelo V1 (Base) - Teto Técnico com Dados Limitados

**Dataset**: `Loan_default.csv` (16 features básicas)

**Performance (threshold=0.5)**:
- 📊 **Recall**: 69% (limite com features disponíveis)
- 📊 **Precision**: 22%
- 🔴 **Falsos Negativos (FN)**: 2.761 (clientes ruins aprovados)
- 🟡 **Falsos Positivos (FP)**: 21.374 (clientes bons recusados)

### Modelo V2 (Enriquecido) - Poder dos Dados Externos

**Dataset**: `Loan_default_ENRICHED.csv` (17 features - **+ score_bureau**)

**Performance (threshold=0.5)**:
- 📊 **Recall**: 93% (**+24 pontos percentuais**)
- 📊 **Precision**: 71% (**+49 pontos percentuais**)
- 🔴 **Falsos Negativos (FN)**: 583 (**-79% de redução!**)
- 🟡 **Falsos Positivos (FP)**: 3.389 (**-84% de redução!**)

### O Valor da Integração de Dados Externos

**Com apenas UMA feature adicional (`score_bureau`)**, o Modelo V2:
- ✅ Reduz erros críticos (FN) em ~80%
- ✅ Reduz custos de atrito (FP) em ~84%
- ✅ Aumenta precisão geral do modelo drasticamente
- ✅ **Demonstra o ROI de investir em enriquecimento de dados**

**Recomendação Estratégica**: Integrar bureaus de crédito (Serasa, Boa Vista) é mais efetivo que hiper-otimizar o modelo base.

---

## 🏗️ Arquitetura do Sistema

### Visão Geral

```
pred_cred/
├── backend/              # API FastAPI com ML
│   ├── config/           # Configurações centralizadas
│   ├── core/             # Carregamento de modelos e regras de negócio
│   ├── models/           # Schemas Pydantic (request/response)
│   ├── services/         # Lógica de negócio (predição, threshold)
│   ├── api/routes/       # Endpoints REST (health, scoring, threshold)
│   ├── artifacts/        # Modelos treinados (.joblib)
│   ├── data/             # Datasets (CSV)
│   └── app.py            # Application Factory
│
└── predcred_frontend/    # Dashboard React
    ├── src/
    │   ├── components/
    │   │   ├── common/   # Componentes compartilhados
    │   │   ├── scoring/  # Domínio de scoring individual
    │   │   └── simulator/ # Domínio de simulação de threshold
    │   ├── hooks/        # Custom hooks (useScoring, useOptimization)
    │   ├── utils/        # Funções auxiliares (API calls)
    │   └── constants/    # Configurações e valores fixos
    └── package.json
```

### Stack Tecnológico

#### Backend
- **Framework**: FastAPI (Python 3.12)
- **ML**: scikit-learn, imbalanced-learn (SMOTE)
- **Data**: pandas, numpy
- **Validação**: Pydantic
- **Servidor**: Uvicorn (ASGI)

#### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS Modules

---

## 🚀 Como Executar

### 1. Pré-requisitos

- **Python 3.12+** (para backend)
- **Node.js 16+** (para frontend)
- **Git**

### 2. Clonar Repositório

```bash
git clone https://github.com/rickvelloso/pred_cred.git
cd pred_cred
```

### 3. Setup Backend

```bash
# Criar e ativar virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows

# Instalar dependências
cd backend
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend estará em: **http://localhost:8000**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Setup Frontend

```bash
# Em outro terminal
cd predcred_frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Frontend estará em: **http://localhost:5173**

---

## 🎮 Funcionalidades

### 1. Scoring Individual

**Endpoint**: `POST /score/v1` e `POST /score/v2`

Analisa o risco de inadimplência de um cliente específico.

**Exemplo V1** (16 features):
```bash
curl -X POST http://localhost:8000/score/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 32,
    "Income": 65000.0,
    "LoanAmount": 200000.0,
    "CreditScore": 710,
    ...
  }'
```

**Exemplo V2** (17 features - adicionar `score_bureau`):
```bash
curl -X POST http://localhost:8000/score/v2 \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "score_bureau": 720
  }'
```

**Response**:
```json
{
  "prediction_label": 0,
  "probability_high_risk": 0.08,
  "probability_low_risk": 0.92,
  "business_recommendation": "Aprovação Automática (Risco < 50%)"
}
```

### 2. Avaliação de Threshold

**Endpoint**: `GET /evaluate_threshold`

Simula a performance do modelo no conjunto de teste com threshold customizado.

```bash
curl "http://localhost:8000/evaluate_threshold?threshold=0.5&version=v1"
```

**Response**:
```json
{
  "threshold_usado": 0.5,
  "matriz_confusao": {
    "true_negatives": 64320,
    "false_positives": 3389,
    "false_negatives": 583,
    "true_positives": 8313
  },
  "metricas_de_negocio": {
    "total_test_samples": 76605,
    "erro_de_prejuizo_count": 583,
    "erro_de_atrito_count": 3389
  }
}
```

### 3. Otimização de Threshold

**Endpoint**: `GET /optimize`

Encontra o threshold ótimo baseado em custos de erro.

```bash
curl "http://localhost:8000/optimize?false_negative_cost=5000&false_positive_cost=100&version=v1"
```

**Response**:
```json
{
  "optimal_threshold": 0.44,
  "min_total_cost": 5567000.0,
  "fn_at_optimal": 491,
  "fp_at_optimal": 3890,
  "all_points": [...]
}
```

### 4. Dashboard Interativo

**Interface Web** em `http://localhost:5173`:

- ✅ **Aba "Scoring Individual"**: Preencha dados de um cliente e veja o score em tempo real
- ✅ **Aba "Simulador"**: Ajuste threshold e custos, visualize impacto financeiro
- ✅ **Comparação V1 vs V2**: Toggle entre modelos para comparar resultados
- ✅ **Gráficos**: Curva de custo vs threshold
- ✅ **Métricas**: FN, FP, custo total, threshold ótimo

---

## 🧪 Treinamento de Modelos

### Retreinar Modelo V1

```bash
cd backend
python train_v1.py
```

**Artefatos Gerados**:
- `artifacts/risk_model_pipeline_v1.joblib`
- `artifacts/X_test_v1.csv`
- `artifacts/y_test_v1.csv`

### Retreinar Modelo V2

```bash
cd backend
python train_v2.py
```

**Artefatos Gerados**:
- `artifacts/risk_model_pipeline_v2.joblib`
- `artifacts/X_test_v2.csv`
- `artifacts/y_test_v2.csv`

**Motor Unificado**: Ambos usam `model_trainer.py` (padrão DRY).

---

## 🏛️ Princípios de Arquitetura

### Backend (FastAPI)

- ✅ **Clean Code**: Funções pequenas, nomes descritivos
- ✅ **SOLID**: Single Responsibility, Dependency Inversion
- ✅ **Design Patterns**: Application Factory, Service Layer, Repository
- ✅ **Separação de Concerns**: config → core → services → routes
- ✅ **Redução de Código**: 388 linhas → 39 linhas (-90%)

### Frontend (React)

- ✅ **Component Composition**: Componentes pequenos e reutilizáveis
- ✅ **Custom Hooks**: Lógica encapsulada (`useScoring`, `useOptimization`)
- ✅ **Domain-Driven**: Organização por domínio (common, scoring, simulator)
- ✅ **Utilities First**: Funções auxiliares centralizadas
- ✅ **Redução de Código**: 250-380 linhas → 35-50 linhas (-86% média)

---

## 📊 Métricas de Qualidade

### Cobertura de Testes
- ✅ Todos os endpoints testados manualmente
- ✅ Validação de schemas Pydantic
- ✅ Tratamento de erros implementado

### Performance
- ⚡ Cold start: 5-10 segundos (carregamento de modelos)
- ⚡ Scoring: < 100ms
- ⚡ Otimização: ~2-3 segundos (99 thresholds)

### Manutenibilidade
- 📈 **Backend**: Redução de 90% no arquivo principal
- 📈 **Frontend**: Redução média de 86% nos componentes principais
- 📈 **Modularidade**: 10 módulos backend + 15 componentes frontend

---

## 📚 Documentação Detalhada

### Para Desenvolvedores

- **[Backend README](backend/README.md)**: Documentação completa da API
  - Arquitetura de camadas (config, core, services, routes)
  - Classes e métodos detalhados
  - Exemplos de uso de todos os endpoints
  - Instruções de treinamento de modelos

- **[Frontend README](predcred_frontend/README.md)**: Documentação completa do Dashboard
  - Arquitetura de componentes
  - Custom hooks e utilities
  - Props e comportamentos de cada componente
  - Instruções de build e deploy

---

## 🎓 Lições Aprendidas

### 1. Dados > Algoritmos
O Modelo V2 com **1 feature adicional** supera qualquer otimização do V1. **Investir em enriquecimento de dados é mais eficaz que hiper-parametrizar modelos**.

### 2. Clean Code = Manutenibilidade
Refatoração reduziu código em ~85-90% mantendo 100% das funcionalidades. **Menos código = menos bugs**.

### 3. Separação de Concerns
Service Layer no backend e Custom Hooks no frontend **isolam lógica de negócio**, facilitando testes e evolução.

### 4. Threshold Matters
O threshold padrão (0.5) raramente é ótimo. **Ajustar baseado em custos de negócio pode reduzir custos em 20-30%**.

---

## 📝 Roadmap Futuro

- [ ] Testes unitários automatizados (pytest, Jest)
- [ ] CI/CD com GitHub Actions
- [ ] Containerização (Docker/Docker Compose)
- [ ] Deploy em nuvem (AWS/GCP/Azure)
- [ ] Modelo V3 com features comportamentais
- [ ] Autenticação e autorização (JWT)
- [ ] Logging e monitoramento (Prometheus/Grafana)

---

## 👤 Autor

**Rick Velloso**
- GitHub: [@rickvelloso](https://github.com/rickvelloso)
- LinkedIn: [Rick Velloso](https://www.linkedin.com/in/pedro-henrique-barreto-velloso-b06063166/)

---

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 🙏 Agradecimentos

- **LocPay**: Inspiração do case técnico original
- **FastAPI**: Framework excepcional para APIs de ML
- **React**: Biblioteca UI moderna e poderosa
- **Comunidade Open Source**: Ferramentas incríveis (scikit-learn, Vite, etc.)
