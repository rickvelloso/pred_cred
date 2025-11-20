# PredCred Frontend - Dashboard Interativo de Análise de Risco

**Versão:** 1.0.0 (Arquitetura Modular com Clean Code)

## 📜 Descrição

Dashboard React moderno e responsivo para análise comparativa de modelos de risco de crédito. Permite scoring individual de clientes e simulação de impacto financeiro com diferentes thresholds de decisão, comparando modelos V1 (base) e V2 (enriquecido) em tempo real.

### Características Principais

- ✅ **Arquitetura Modular**: Separação por domínio (common, scoring, simulator)
- ✅ **Custom Hooks**: Lógica de estado encapsulada e reutilizável
- ✅ **Component Composition**: Componentes pequenos e focados
- ✅ **Utility Functions**: Funções auxiliares centralizadas
- ✅ **Constants Management**: Configurações e valores fixos organizados
- ✅ **Clean Code**: Redução de 86-91% no tamanho dos componentes principais

---

## 🏗️ Arquitetura do Projeto

```
predcred_frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Componentes compartilhados
│   │   │   ├── ColdStartBanner.jsx    # Banner de cold start da API
│   │   │   ├── ErrorMessage.jsx       # Exibição de erros
│   │   │   ├── LoadingIndicator.jsx   # Indicador de carregamento
│   │   │   ├── ModelSelector.jsx      # Seletor de modelo (V1/V2)
│   │   │   └── TabNavigation.jsx      # Navegação entre abas
│   │   ├── scoring/             # Domínio de scoring individual
│   │   │   ├── FormField.jsx          # Campo de formulário reutilizável
│   │   │   ├── IndividualScoring.jsx  # Container principal de scoring
│   │   │   ├── ModelToggle.jsx        # Toggle V1/V2 para scoring
│   │   │   ├── ScoreResult.jsx        # Exibição do resultado do score
│   │   │   └── ScoringForm.jsx        # Formulário de entrada de dados
│   │   └── simulator/           # Domínio de simulação de threshold
│   │       ├── CostChart.jsx          # Gráfico de custo vs threshold
│   │       ├── FinancialInputs.jsx    # Inputs de custos FN/FP
│   │       ├── MetricsDisplay.jsx     # Exibição de métricas
│   │       ├── OptimizationSummary.jsx # Resumo da otimização
│   │       └── SimulatorView.jsx      # Container principal do simulador
│   ├── hooks/
│   │   ├── useOptimization.js   # Hook para otimização de threshold
│   │   └── useScoring.js        # Hook para scoring individual
│   ├── utils/
│   │   └── api.js               # Funções de comunicação com API
│   ├── constants/
│   │   └── index.js             # Constantes e configurações
│   ├── App.jsx                  # Componente raiz da aplicação
│   └── main.jsx                 # Entry point
├── public/                      # Arquivos estáticos
├── package.json                 # Dependências e scripts
└── vite.config.js              # Configuração do Vite
```

---

## 📦 Componentes e Hooks

### 1. Common Components (`components/common/`)

#### `TabNavigation.jsx`
**Responsabilidade:** Navegação entre "Scoring Individual" e "Simulador"

**Props:**
- `activeTab` (string): Aba ativa ("individual" | "simulator")
- `onTabChange` (function): Callback de mudança de aba

**Uso:**
```jsx
<TabNavigation 
  activeTab="individual" 
  onTabChange={(tab) => setActiveTab(tab)} 
/>
```

#### `ModelSelector.jsx`
**Responsabilidade:** Seletor global de modelo (V1/V2)

**Props:**
- `selectedModel` (string): Modelo selecionado ("v1" | "v2")
- `onModelChange` (function): Callback de mudança de modelo

**Características:**
- Exibe descrição de cada modelo
- Destaca modelo ativo
- Comunica mudança via callback

#### `ColdStartBanner.jsx`
**Responsabilidade:** Aviso de tempo de carregamento inicial da API

**Props:**
- `show` (boolean): Controla visibilidade do banner

**Comportamento:**
- Exibe alerta sobre cold start (5-10 segundos)
- Auto-ocultável após primeira resposta

#### `LoadingIndicator.jsx`
**Responsabilidade:** Indicador visual de carregamento

**Uso:**
```jsx
{loading && <LoadingIndicator />}
```

#### `ErrorMessage.jsx`
**Responsabilidade:** Exibição formatada de mensagens de erro

**Props:**
- `message` (string): Mensagem de erro a exibir

---

### 2. Scoring Components (`components/scoring/`)

#### `IndividualScoring.jsx`
**Responsabilidade:** Container principal da funcionalidade de scoring

**Props:**
- `selectedModel` (string): Modelo a usar para scoring

**Características:**
- Usa hook `useScoring` para lógica de estado
- Gerencia formulário e resultado
- Exibe cold start banner
- Trata erros de API

**Redução:** De 250 linhas para 35 linhas (-86%)

#### `ScoringForm.jsx`
**Responsabilidade:** Formulário de entrada de dados do cliente

**Props:**
- `formData` (object): Dados do formulário
- `onSubmit` (function): Callback de submissão
- `onChange` (function): Callback de mudança de campo
- `selectedModel` (string): Modelo selecionado (para campos condicionais)
- `loading` (boolean): Estado de carregamento

**Características:**
- Campos dinâmicos baseados no modelo (V2 adiciona `score_bureau`)
- Validação de entrada
- Organização em grid responsivo
- Usa componente `FormField` reutilizável

#### `FormField.jsx`
**Responsabilidade:** Campo de formulário reutilizável

**Props:**
- `label` (string): Rótulo do campo
- `name` (string): Nome do campo
- `type` (string): Tipo do input
- `value` (any): Valor atual
- `onChange` (function): Callback de mudança
- `required` (boolean): Campo obrigatório
- `options` (array): Opções para select

**Tipos Suportados:**
- `"text"`, `"number"`, `"select"`

#### `ScoreResult.jsx`
**Responsabilidade:** Exibição do resultado da predição

**Props:**
- `result` (object): Objeto com resultado da API
  - `probability_high_risk` (number)
  - `probability_low_risk` (number)
  - `business_recommendation` (string)

**Características:**
- Medidor visual de probabilidade
- Recomendação de negócio destacada
- Design responsivo

#### `ModelToggle.jsx`
**Responsabilidade:** Toggle específico para scoring (alternativa ao ModelSelector)

**Props:**
- `selectedModel` (string)
- `onModelChange` (function)

---

### 3. Simulator Components (`components/simulator/`)

#### `SimulatorView.jsx`
**Responsabilidade:** Container principal da funcionalidade de simulação

**Props:**
- `selectedModel` (string): Modelo a usar para simulação

**Características:**
- Usa hook `useOptimization` para lógica de estado
- Gerencia inputs financeiros e otimização
- Exibe métricas e gráfico
- Trata erros de API

**Redução:** De 380 linhas para 50 linhas (-87%)

#### `FinancialInputs.jsx`
**Responsabilidade:** Inputs de custos de erro (FN/FP)

**Props:**
- `fnCost` (number): Custo de falso negativo
- `fpCost` (number): Custo de falso positivo
- `onFnCostChange` (function): Callback de mudança FN
- `onFpCostChange` (function): Callback de mudança FP
- `onOptimize` (function): Callback de otimização
- `loading` (boolean): Estado de carregamento

**Validações:**
- Custos devem ser > 0
- FN cost deve ser > FP cost

#### `MetricsDisplay.jsx`
**Responsabilidade:** Exibição de métricas do threshold atual

**Props:**
- `threshold` (number): Threshold atual
- `onThresholdChange` (function): Callback de mudança de threshold
- `metrics` (object): Métricas calculadas
  - `fn_count`, `fp_count`, `total_cost`
- `loading` (boolean): Estado de carregamento

**Características:**
- Slider de threshold (0.01 - 0.99)
- Cards de métricas (FN, FP, Custo Total)
- Formatação de valores monetários

#### `OptimizationSummary.jsx`
**Responsabilidade:** Resumo do threshold ótimo

**Props:**
- `optimizationData` (object): Resultado da otimização
  - `optimal_threshold`
  - `min_total_cost`
  - `fn_at_optimal`
  - `fp_at_optimal`

**Características:**
- Destaque do threshold ótimo
- Comparação com threshold atual
- Métricas no ponto ótimo

#### `CostChart.jsx`
**Responsabilidade:** Gráfico de custo total vs threshold

**Props:**
- `data` (array): Array de pontos `{threshold, total_cost}`
- `optimalThreshold` (number): Threshold ótimo (destaque no gráfico)

**Características:**
- Visualização da curva de custo
- Marcação do ponto ótimo
- Responsivo

---

### 4. Custom Hooks (`hooks/`)

#### `useScoring.js`
**Responsabilidade:** Lógica de estado para scoring individual

**Retorno:**
```javascript
{
  formData,           // Objeto com dados do formulário
  setFormData,        // Setter do formulário
  result,             // Resultado da predição
  loading,            // Estado de carregamento
  error,              // Mensagem de erro
  showColdStart,      // Flag de cold start
  handleInputChange,  // Handler de mudança de input
  handleSubmit        // Handler de submissão
}
```

**Características:**
- Gerencia estado do formulário
- Chama API de scoring
- Trata cold start
- Gerencia erros

#### `useOptimization.js`
**Responsabilidade:** Lógica de estado para simulação de threshold

**Retorno:**
```javascript
{
  threshold,          // Threshold atual
  setThreshold,       // Setter do threshold
  fnCost,             // Custo de falso negativo
  setFnCost,          // Setter FN cost
  fpCost,             // Custo de falso positivo
  setFpCost,          // Setter FP cost
  metrics,            // Métricas do threshold atual
  optimizationData,   // Dados de otimização
  loading,            // Estado de carregamento
  error,              // Mensagem de erro
  evaluateThreshold,  // Função de avaliação
  optimize            // Função de otimização
}
```

**Características:**
- Gerencia estado de inputs financeiros
- Chama API de avaliação e otimização
- Calcula métricas
- Trata erros

---

### 5. Utilities (`utils/`)

#### `api.js`
**Funções:** `scoreClient`, `evaluateThreshold`, `optimizeThreshold`

##### `scoreClient(clientData, model)`
Envia dados do cliente para scoring.

**Parâmetros:**
- `clientData` (object): Dados do formulário
- `model` (string): "v1" ou "v2"

**Retorno:**
```javascript
{
  prediction_label: 0 | 1,
  probability_high_risk: number,
  probability_low_risk: number,
  business_recommendation: string
}
```

##### `evaluateThreshold(threshold, model)`
Avalia threshold no conjunto de teste.

**Parâmetros:**
- `threshold` (number): Valor do threshold
- `model` (string): "v1" ou "v2"

**Retorno:**
```javascript
{
  threshold_usado: number,
  matriz_confusao: object,
  metricas_de_negocio: object,
  classification_report: object
}
```

##### `optimizeThreshold(fnCost, fpCost, model)`
Otimiza threshold baseado em custos.

**Parâmetros:**
- `fnCost` (number): Custo de falso negativo
- `fpCost` (number): Custo de falso positivo
- `model` (string): "v1" ou "v2"

**Retorno:**
```javascript
{
  optimal_threshold: number,
  min_total_cost: number,
  fn_at_optimal: number,
  fp_at_optimal: number,
  all_points: array
}
```

---

### 6. Constants (`constants/`)

#### `index.js`
**Constantes Exportadas:**

- `API_BASE_URL`: URL base da API (http://127.0.0.1:8000)
- `MODEL_VERSIONS`: Configuração de modelos disponíveis
- `INITIAL_FORM_DATA`: Estado inicial do formulário de scoring
- `DEFAULT_FINANCIAL_PARAMS`: Custos padrão (FN: 5000, FP: 100)
- `THRESHOLD_CONFIG`: Configuração do slider (min: 0.01, max: 0.99, step: 0.01)

---

## 🚀 Como Executar

### 1. Pré-requisitos

- Node.js 16+
- npm ou yarn
- Backend rodando em `http://127.0.0.1:8000`

### 2. Instalar Dependências

```bash
cd predcred_frontend
npm install
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### 4. Build para Produção

```bash
npm run build
```

Arquivos gerados em: `dist/`

### 5. Preview do Build

```bash
npm run preview
```

---

## 🛠️ Tecnologias

- **React 19**: Biblioteca UI
- **Vite**: Build tool moderno e rápido
- **Axios**: Cliente HTTP
- **CSS Modules**: Estilos encapsulados

---

## 🏛️ Princípios Aplicados

### Clean Code
- Componentes pequenos e focados (< 50 linhas em média)
- Nomes descritivos e semânticos
- Funções puras sempre que possível
- Separação de concerns

### React Best Practices
- **Custom Hooks**: Lógica reutilizável e testável
- **Component Composition**: Composição sobre herança
- **Props Drilling Mitigation**: Hooks locais por domínio
- **Single Responsibility**: Um componente = uma responsabilidade

### Arquitetura
- **Domain-Driven**: Organização por domínio (common, scoring, simulator)
- **Utility-First**: Funções auxiliares centralizadas
- **Constants Management**: Valores fixos em módulo dedicado

---

## 📊 Métricas de Refatoração

### IndividualScoring.jsx
- **Antes**: 250 linhas
- **Depois**: 35 linhas
- **Redução**: 86%

### SimulatorView.jsx
- **Antes**: 380 linhas
- **Depois**: 50 linhas
- **Redução**: 87%

### App.jsx
- **Antes**: 150 linhas
- **Depois**: 40 linhas
- **Redução**: 73%

**Média Geral**: ~82% de redução de código mantendo 100% das funcionalidades.

---

## 📝 Changelog

### v1.0.0 - Refatoração Arquitetural
- Migração para arquitetura modular por domínio
- Criação de custom hooks (`useScoring`, `useOptimization`)
- Extração de utilities e constants
- Componentes reutilizáveis (FormField, LoadingIndicator, etc.)
- Redução média de 86% no tamanho dos componentes principais

### v0.3.0 - Funcionalidades Iniciais
- Scoring individual V1/V2
- Simulador de threshold
- Comparação A/B de modelos

---

## 📖 Documentação Adicional

Para informações sobre o backend e visão geral do sistema, consulte:
- [Backend README](../backend/README.md)
- [README Principal](../README.md)
