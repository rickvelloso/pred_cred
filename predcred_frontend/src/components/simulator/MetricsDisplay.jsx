import { memo } from 'react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import './MetricsDisplay.css';

const MetricCard = ({ className, icon, title, description, value, details, footnote }) => (
  <div className={`metric-card ${className}`}>
    <h3>{icon} {title}</h3>
    <p>{description}</p>
    <div className="metric-value financial">{value}</div>
    <div className="metric-details">{details}</div>
    <span className="metric-description">{footnote}</span>
  </div>
);

const MetricsDisplay = memo(({ financials }) => {
  if (!financials) return null;

  const { prejuizoCount, atritoCount, totalSamples, totalLoss, totalOpportunityCost, totalErrorCost } = financials;
  const prejuizoPercent = (prejuizoCount / totalSamples) * 100;
  const atritoPercent = (atritoCount / totalSamples) * 100;

  return (
    <div className="metrics-display">
      <h2 className="metrics-title">💵 Impacto Financeiro no Threshold Ótimo</h2>
      
      <div className="metrics-grid">
        <MetricCard
          className="error-prejuizo"
          icon="🔴"
          title="Erro de Prejuízo (FN)"
          description='Clientes "Ruins" que foram APROVADOS'
          value={formatCurrency(totalLoss)}
          details={
            <>
              <span className="count-badge">{formatNumber(prejuizoCount)} clientes</span>
              <span className="percent-badge">{formatPercentage(prejuizoPercent)} do total</span>
            </>
          }
          footnote="Prejuízo Direto (Default + Inadimplência)"
        />

        <MetricCard
          className="error-atrito"
          icon="🟡"
          title="Erro de Atrito (FP)"
          description='Clientes "Bons" que foram RECUSADOS'
          value={formatCurrency(totalOpportunityCost)}
          details={
            <>
              <span className="count-badge">{formatNumber(atritoCount)} clientes</span>
              <span className="percent-badge">{formatPercentage(atritoPercent)} do total</span>
            </>
          }
          footnote="Perda de Receita (Custo de Oportunidade)"
        />

        <MetricCard
          className="total-cost"
          icon="💰"
          title="Custo Total do Erro"
          description="Soma dos dois tipos de erro"
          value={formatCurrency(totalErrorCost)}
          details={<span className="formula-badge">FN × Prejuízo + FP × Lucro Perdido</span>}
          footnote="Custo Total Minimizado no Threshold Ótimo"
        />
      </div>
    </div>
  );
});

MetricsDisplay.displayName = 'MetricsDisplay';

export default MetricsDisplay;
