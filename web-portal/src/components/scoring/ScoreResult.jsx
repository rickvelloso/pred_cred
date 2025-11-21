import { getRiskLevel, getRiskLevelLabel, isApprovedRecommendation } from '../../utils/formatters';
import './ScoreResult.css';

const ScoreResult = ({ result }) => {
  if (!result) return null;

  const approved = isApprovedRecommendation(result.business_recommendation);
  const riskPercentage = (result.probability_high_risk * 100).toFixed(2);
  const riskLevel = getRiskLevel(riskPercentage);
  const riskLabel = getRiskLevelLabel(riskPercentage);

  return (
    <div className={`score-result-card ${approved ? 'approved' : 'rejected'}`}>
      <div className="result-header">
        <h3>Resultado da Análise</h3>
        <span className={`status-badge ${approved ? 'status-approved' : 'status-rejected'}`}>
          {approved ? '✓ Aprovado' : '✗ Recusado'}
        </span>
      </div>
      
      <div className="result-content">
        <div className="result-item">
          <label>Recomendação de Negócio:</label>
          <p className="recommendation">{result.business_recommendation}</p>
        </div>
        
        <div className="result-item">
          <label>Probabilidade de Risco Alto:</label>
          <p className="risk-probability">
            {riskPercentage}%
            <span className={`risk-level ${riskLevel}`}>{riskLabel}</span>
          </p>
        </div>

        {result.threshold && (
          <div className="result-item">
            <label>Threshold Aplicado:</label>
            <p>{(result.threshold * 100).toFixed(0)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreResult;
