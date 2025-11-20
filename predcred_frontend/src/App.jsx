import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import CostChart from './components/CostChart';
import MetricsDisplay from './components/MetricsDisplay';
import OptimizationSummary from './components/OptimizationSummary';
import IndividualScoring from './components/IndividualScoring';

// Local hosted backend para testes internos
//const API_URL = 'http://127.0.0.1:8000';
const API_URL = 'https://predcred-api.onrender.com'; 

function App() {
  const [view, setView] = useState('simulator'); // 'simulator' ou 'individual'
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showColdStartWarning, setShowColdStartWarning] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [modelVersion, setModelVersion] = useState('v2'); // v1 ou v2
  const [lossPerFN, setLossPerFN] = useState(5000);
  const [profitPerFP, setProfitPerFP] = useState(800);

  const fetchOptimization = useCallback(async (version, lossFn, profitFp) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/optimize`, {
        params: { 
          model_version: version,
          loss_per_fn: lossFn,
          profit_per_fp: profitFp
        },
        timeout: 90000 
      });
      
      setOptimization(response.data);
      
      // Remove o aviso após o primeiro carregamento bem-sucedido
      if (isFirstLoad) {
        setIsFirstLoad(false);
        setTimeout(() => setShowColdStartWarning(false), 3000);
      }

    } catch (err) {
      console.error("Erro ao buscar otimização:", err);

      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('O servidor demorou muito para responder (cold start). Por favor, atualize a página em 30 segundos.');
      } else {
        setError('Falha ao conectar na API. O servidor backend está rodando?');
      }

    } finally {
      setLoading(false);
    }
  }, [isFirstLoad]);

  const handleModelChange = (version) => {
    setModelVersion(version);
    fetchOptimization(version, lossPerFN, profitPerFP);
  };

  const handleFinancialChange = useCallback(() => {
    fetchOptimization(modelVersion, lossPerFN, profitPerFP);
  }, [modelVersion, lossPerFN, profitPerFP, fetchOptimization]);

  // Carrega os dados iniciais ao montar o componente
  useEffect(() => {
    fetchOptimization(modelVersion, lossPerFN, profitPerFP);
  }, []);

  // Cálculo das métricas financeiras no threshold ótimo
  const financialMetrics = useMemo(() => {
    if (!optimization) return null;

    const totalLoss = optimization.fn_at_optimal * lossPerFN;
    const totalOpportunityCost = optimization.fp_at_optimal * profitPerFP;
    const totalErrorCost = totalLoss + totalOpportunityCost;

    return {
      totalLoss,
      totalOpportunityCost,
      totalErrorCost,
      prejuizoCount: optimization.fn_at_optimal,
      atritoCount: optimization.fp_at_optimal,
      totalSamples: optimization.all_points && optimization.all_points.length > 0 
        ? optimization.all_points[0].fn_count + optimization.all_points[0].fp_count 
        : 76605
    };
  }, [optimization, lossPerFN, profitPerFP]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dashboard de Comparação A/B (PredCred)</h1>
        <p>Compare o desempenho dos modelos V1 (base) e V2 (enriquecido) em tempo real.</p>
        <a 
          href="https://github.com/rickvelloso/pred_cred" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
        >
          <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Ver no GitHub
        </a>
      </header>

      {showColdStartWarning && (
        <div className="cold-start-banner">
          <div className="cold-start-content">
            <svg className="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div className="cold-start-text">
              <strong>⚡ Free Tier Hosting Notice:</strong> The backend is hosted on Render's free tier. 
              Initial load may take 30-60 seconds due to cold start. This is a hosting limitation, not a software issue.
            </div>
            <button 
              className="cold-start-close"
              onClick={() => setShowColdStartWarning(false)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="navigation-tabs">
        <button 
          className={`tab-button ${view === 'simulator' ? 'active' : ''}`}
          onClick={() => setView('simulator')}
        >
          📊 Simulador de Risco
        </button>
        <button 
          className={`tab-button ${view === 'individual' ? 'active' : ''}`}
          onClick={() => setView('individual')}
        >
          🔍 Análise Individual
        </button>
      </div>
      
      {/* Conteúdo do Simulador */}
      {view === 'simulator' && (
        <>
          <div className="model-selector">
        <h3>Selecione o Modelo</h3>
        <div className="model-buttons">
          <button 
            className={`model-button ${modelVersion === 'v1' ? 'active' : ''}`}
            onClick={() => handleModelChange('v1')}
            disabled={loading}
          >
            <div className="model-badge">V1</div>
            <div className="model-name">Modelo Base</div>
            <div className="model-description">Features básicas</div>
          </button>
          <button 
            className={`model-button ${modelVersion === 'v2' ? 'active' : ''}`}
            onClick={() => handleModelChange('v2')}
            disabled={loading}
          >
            <div className="model-badge">V2</div>
            <div className="model-name">Modelo Enriquecido</div>
            <div className="model-description">Features + Bureau Score</div>
          </button>
        </div>
      </div>
      
      <div className="financial-inputs">
        <h3>💰 Parâmetros Financeiros do Otimizador</h3>
        <p className="financial-subtitle">Ajuste os valores para recalcular o threshold ótimo</p>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="lossPerFN">
              <span className="label-icon">🔴</span>
              Prejuízo Médio por Cliente Ruim (R$)
            </label>
            <input
              id="lossPerFN"
              type="number"
              min="0"
              step="100"
              value={lossPerFN}
              onChange={(e) => setLossPerFN(Number(e.target.value))}
              onBlur={handleFinancialChange}
              className="financial-input"
              disabled={loading}
            />
            <span className="input-help">Valor médio perdido quando um cliente ruim é aprovado (default + inadimplência)</span>
          </div>
          
          <div className="input-group">
            <label htmlFor="profitPerFP">
              <span className="label-icon">🟡</span>
              Lucro Médio por Cliente Bom (R$)
            </label>
            <input
              id="profitPerFP"
              type="number"
              min="0"
              step="50"
              value={profitPerFP}
              onChange={(e) => setProfitPerFP(Number(e.target.value))}
              onBlur={handleFinancialChange}
              className="financial-input"
              disabled={loading}
            />
            <span className="input-help">Valor médio de lucro perdido quando um cliente bom é recusado</span>
          </div>
        </div>
        <div className="recalculate-section">
          <button 
            className="recalculate-button" 
            onClick={handleFinancialChange}
            disabled={loading}
          >
            {loading ? '⏳ Otimizando...' : '🔄 Recalcular Otimização'}
          </button>
        </div>
      </div>

      {loading && <div className="loading-indicator">Calculando threshold ótimo com 100 simulações...</div>}
      {error && <div className="error-message">{error}</div>}

      {optimization && (
        <>
          <OptimizationSummary optimization={optimization} />
          <CostChart 
            data={optimization.all_points} 
            optimalThreshold={optimization.optimal_threshold}
            lossPerFN={lossPerFN}
            profitPerFP={profitPerFP}
          />
          <MetricsDisplay financials={financialMetrics} />
        </>
      )}
        </>
      )}

      {/* Conteúdo da Análise Individual */}
      {view === 'individual' && <IndividualScoring />}
    </div>
  );
}

export default App;