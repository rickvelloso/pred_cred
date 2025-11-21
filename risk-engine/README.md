# PredCred Risk Engine - Motor de IA para Análise de Risco de Crédito

**Versão:** 1.0.0 (Arquitetura Modular)

## 📜 Descrição

API REST de Machine Learning construída com FastAPI, aplicando princípios de Clean Code e SOLID. O sistema fornece análise preditiva de risco de inadimplência através de dois modelos independentes, permitindo comparação A/B e demonstração do impacto do enriquecimento de dados.

### Características Principais

- ✅ **Arquitetura Modular**: Separação clara de responsabilidades (config, core, services, routes)
- ✅ **Service Layer Pattern**: Lógica de negócio isolada das rotas HTTP
- ✅ **Application Factory**: Padrão para instanciação testável da aplicação
- ✅ **Dependency Injection**: Serviços injetados via FastAPI Depends
- ✅ **SOLID Principles**: Single Responsibility, Open/Closed, Dependency Inversion
- ✅ **Multi-Model Support**: V1 (base) e V2 (enriquecido) em paralelo

---

## 🏗️ Arquitetura do Projeto

```
risk-engine/
├── config/
│   └── settings.py          # Configurações centralizadas
├── core/
│   ├── model_loader.py      # Carregamento e gerenciamento de modelos ML
│   └── business_rules.py    # Regras de negócio isoladas
├── models/
│   ├── schemas.py           # Schemas de request (Pydantic)
│   └── responses.py         # Schemas de response (Pydantic)
├── services/
│   └── prediction_service.py # Lógica de negócio (predição, threshold)
├── api/
│   └── routes/
│       ├── health.py        # Health check
│       ├── scoring.py       # Endpoints de scoring V1/V2
│       └── threshold.py     # Avaliação e otimização de threshold
├── artifacts/               # Modelos treinados e dados de teste
├── data/                    # Datasets
├── app.py                   # Application factory
├── main.py                  # Entry point (backward compatibility)
├── model_trainer.py         # Motor de treinamento reutilizável
├── train_v1.py             # Script de treinamento V1
└── train_v2.py             # Script de treinamento V2
```

---

## 📦 Módulos e Classes

### 1. Config Layer (`config/`)

#### `settings.py`
Centraliza todas as configurações da aplicação.

**Constantes:**
- `API_TITLE`, `API_VERSION`, `API_DESCRIPTION`: Metadados da API
- `MODEL_VERSIONS`: Lista de versões de modelo disponíveis
- `RISK_THRESHOLDS`: Limiares de risco para recomendações de negócio
- `OPTIMIZATION_CONFIG`: Configurações de otimização de threshold
- `DEFAULT_BUSINESS_PARAMS`: Parâmetros de custo para análise de negócio

**Funções:**
- `get_cors_origins() -> list[str]`: Retorna origens permitidas para CORS

---

### 2. Core Layer (`core/`)

#### `model_loader.py`
**Classe:** `ModelLoader`

Responsável pelo ciclo de vida dos modelos de Machine Learning.

**Métodos:**
- `load_all_models()`: Carrega todos os modelos e dados de teste no startup
- `get_model(version: str) -> Pipeline`: Retorna pipeline do modelo solicitado
- `get_test_data(version: str) -> tuple[pd.DataFrame, pd.Series]`: Retorna dados de teste

**Características:**
- Singleton pattern para modelos carregados
- Tratamento de erros para modelos não encontrados
- Logging detalhado do processo de carregamento

#### `business_rules.py`
**Função:** `get_business_recommendation(probability_high_risk: float) -> str`

Aplica regras de negócio baseadas em thresholds de risco.

**Retornos:**
- `"Aprovação Automática (Risco < 50%)"`: Risco baixo
- `"Análise Manual (Risco > 50%)"`: Risco alto
- `"Recusa Automática (Risco > 70%)"`: Risco muito alto

---

### 3. Models Layer (`models/`)

#### `schemas.py`
Define esquemas de validação para requisições (input).

**Classes:**
- `ContractFeaturesBase`: Features comuns a todas as versões
  - Age, Income, LoanAmount, CreditScore, MonthsEmployed, etc.
  
- `ContractFeaturesV1(ContractFeaturesBase)`: Modelo base (16 features)
  
- `ContractFeaturesV2(ContractFeaturesBase)`: Modelo enriquecido (17 features)
  - Adiciona: `score_bureau` (score de bureau de crédito)

#### `responses.py`
Define esquemas de validação para respostas (output).

**Classes:**
- `ScoreResponse`: Resposta de predição individual
- `ConfusionMatrixDetails`: Detalhes da matriz de confusão
- `BusinessMetrics`: Métricas de negócio (erros de prejuízo/atrito)
- `ThresholdEvaluationResponse`: Avaliação completa de threshold
- `ThresholdPoint`: Ponto de otimização de threshold
- `OptimizationResponse`: Resultado de otimização de threshold

---

### 4. Services Layer (`services/`)

#### `prediction_service.py`
**Classes:** `PredictionService`, `ThresholdService`

##### `PredictionService`
Encapsula lógica de predição de risco.

**Construtor:**
```python
PredictionService(model_loader: ModelLoader)
```

**Métodos:**
- `predict_risk(features: dict, version: str) -> ScoreResponse`
  - Converte features para DataFrame
  - Executa predição no modelo
  - Aplica regras de negócio
  - Retorna score estruturado

##### `ThresholdService`
Encapsula lógica de avaliação e otimização de threshold.

**Construtor:**
```python
ThresholdService(model_loader: ModelLoader)
```

**Métodos:**
- `evaluate_threshold(threshold: float, version: str) -> ThresholdEvaluationResponse`
  - Avalia modelo no conjunto de teste
  - Calcula matriz de confusão
  - Gera métricas de classificação
  - Retorna análise completa

- `optimize_threshold(fn_cost: float, fp_cost: float, version: str) -> OptimizationResponse`
  - Testa thresholds de 0.01 a 0.99
  - Calcula custo total para cada threshold
  - Identifica threshold de custo mínimo
  - Retorna curva de otimização completa

---

### 5. API Layer (`api/routes/`)

#### `health.py`
**Rota:** `GET /`

Health check endpoint.

**Response:**
```json
{
  "status": "API de Risco Imobiliário está online e operacional."
}
```

#### `scoring.py`
**Rotas:** `POST /score/v1`, `POST /score/v2`

Endpoints de scoring individual.

**Exemplo V1:**
```bash
curl -X POST http://localhost:8000/score/v1 \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 32,
    "Income": 65000.0,
    "LoanAmount": 200000.0,
    "CreditScore": 710,
    "MonthsEmployed": 48,
    "NumCreditLines": 3,
    "InterestRate": 12.5,
    "LoanTerm": 36,
    "DTIRatio": 0.25,
    "Education": "Bachelors",
    "EmploymentType": "Full-time",
    "MaritalStatus": "Married",
    "HasMortgage": "Yes",
    "HasDependents": "No",
    "LoanPurpose": "Home",
    "HasCoSigner": "No"
  }'
```

**Response:**
```json
{
  "prediction_label": 1,
  "probability_high_risk": 0.5167,
  "probability_low_risk": 0.4833,
  "business_recommendation": "Análise Manual (Risco > 50%)"
}
```

**Exemplo V2 (adicionar `score_bureau`):**
```bash
curl -X POST http://localhost:8000/score/v2 \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "score_bureau": 720
  }'
```

#### `threshold.py`
**Rotas:** `GET /evaluate_threshold`, `GET /optimize`

##### `GET /evaluate_threshold`
Avalia performance do modelo em threshold específico.

**Query Parameters:**
- `threshold` (float, default=0.5): Limiar de decisão
- `version` (str, default="v1"): Versão do modelo ("v1" ou "v2")

**Exemplo:**
```bash
curl "http://localhost:8000/evaluate_threshold?threshold=0.5&version=v1"
```

##### `GET /optimize`
Otimiza threshold baseado em custos de erro.

**Query Parameters:**
- `false_negative_cost` (float, default=5000): Custo de aprovar cliente ruim
- `false_positive_cost` (float, default=100): Custo de recusar cliente bom
- `version` (str, default="v1"): Versão do modelo

**Validações:**
- Custos devem ser > 0
- false_negative_cost deve ser > false_positive_cost

**Exemplo:**
```bash
curl "http://localhost:8000/optimize?false_negative_cost=5000&false_positive_cost=100&version=v1"
```

**Response:**
```json
{
  "optimal_threshold": 0.44,
  "min_total_cost": 5567000.0,
  "fn_at_optimal": 491,
  "fp_at_optimal": 3890,
  "all_points": [...]
}
```

---

### 6. Application (`app.py`)

**Função:** `create_app() -> FastAPI`

Application Factory Pattern para criação da instância FastAPI.

**Responsabilidades:**
- Cria instância FastAPI com metadados
- Configura CORS middleware
- Registra todos os routers
- Define eventos de startup (carregamento de modelos)

**Uso:**
```python
from app import create_app

app = create_app()
```

---

## 🚀 Como Executar

### 1. Pré-requisitos

- Python 3.12+
- Virtual environment ativo

### 2. Instalar Dependências

```bash
cd risk-engine
pip install -r requirements.txt
```

### 3. Iniciar Servidor

```bash
# Usando main.py (backward compatibility)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ou diretamente via app.py
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 4. Acessar Documentação

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🧪 Treinamento de Modelos

### Modelo V1 (Base)
```bash
python train_v1.py
```

**Características:**
- Dataset: `data/Loan_default.csv`
- Features: 16 campos básicos
- Artefatos: `artifacts/risk_model_pipeline_v1.joblib`

### Modelo V2 (Enriquecido)
```bash
python train_v2.py
```

**Características:**
- Dataset: `data/Loan_default_ENRICHED.csv`
- Features: 17 campos (incluindo `score_bureau`)
- Artefatos: `artifacts/risk_model_pipeline_v2.joblib`

**Motor Unificado:**
Ambos os scripts usam `model_trainer.py` (padrão DRY).

---

## 📊 Performance dos Modelos

### Modelo V1 (threshold=0.5)
- **Recall**: 69%
- **Precision**: 22%
- **Falsos Negativos**: 2.761
- **Falsos Positivos**: 21.374

### Modelo V2 (threshold=0.5)
- **Recall**: 93% (+24 pp)
- **Precision**: 71% (+49 pp)
- **Falsos Negativos**: 583 (-79%)
- **Falsos Positivos**: 3.389 (-84%)

**Impacto:** Uma feature adicional (`score_bureau`) reduz erros críticos em ~80%.

---

## 🛠️ Tecnologias

- **FastAPI**: Framework web assíncrono
- **Pydantic**: Validação de dados
- **scikit-learn**: Pipeline de ML
- **pandas/numpy**: Manipulação de dados
- **joblib**: Persistência de modelos
- **Uvicorn**: Servidor ASGI

---

## 🏛️ Princípios Aplicados

### Clean Code
- Funções pequenas e focadas
- Nomes descritivos e semânticos
- Código autoexplicativo
- Separação de concerns

### SOLID
- **Single Responsibility**: Cada módulo tem uma responsabilidade única
- **Open/Closed**: Extensível via novos services/routes
- **Dependency Inversion**: Services dependem de abstrações (model_loader)

### Design Patterns
- **Application Factory**: `create_app()`
- **Service Layer**: Lógica de negócio isolada
- **Repository**: `ModelLoader` encapsula acesso a modelos
- **Dependency Injection**: FastAPI Depends

---

## 📝 Changelog

### v1.0.0 - Refatoração Arquitetural
- Migração de arquivo monolítico (388 linhas) para arquitetura modular
- Implementação de camadas (config, core, services, api)
- Separação de schemas (request/response)
- Criação de service layer pattern
- Application factory pattern
- Redução de 90% no arquivo principal

### v0.3.0 - Multi-Modelo
- Suporte a V1 e V2 em paralelo
- Comparação A/B de modelos

---

## 📖 Documentação Adicional

Para informações sobre o Web Portal e visão geral do sistema, consulte:
- [Web Portal README](../web-portal/README.md)
- [README Principal](../README.md)
