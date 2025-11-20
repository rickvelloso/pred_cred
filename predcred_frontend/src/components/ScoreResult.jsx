import './ScoreResult.css';

function ScoreResult({ result }) {
  if (!result) return null;

  const isApproved = result.business_recommendation?.includes('Aprovação') || 
                     result.business_recommendation?.includes('Aprovado');
  
  const riskPercentage = (result.probability_high_risk * 100).toFixed(2);

  return (
    <div className={`score-result-card ${isApproved ? 'approved' : 'rejected'}`}>
      <div className="result-header">
        <h3>Resultado da Análise</h3>
        <span className={`status-badge ${isApproved ? 'status-approved' : 'status-rejected'}`}>
          {isApproved ? '✓ Aprovado' : '✗ Recusado'}
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
            <span className={`risk-level ${riskPercentage < 30 ? 'low' : riskPercentage < 60 ? 'medium' : 'high'}`}>
              {riskPercentage < 30 ? 'Risco Baixo' : riskPercentage < 60 ? 'Risco Médio' : 'Risco Alto'}
            </span>
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
}

export default ScoreResult;
