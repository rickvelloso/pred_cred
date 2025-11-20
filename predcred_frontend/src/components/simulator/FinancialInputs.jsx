import './FinancialInputs.css';

const FinancialInputs = ({ lossPerFN, profitPerFP, onLossChange, onProfitChange, onRecalculate, loading }) => {
  return (
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
            onChange={(e) => onLossChange(Number(e.target.value))}
            onBlur={onRecalculate}
            className="financial-input"
            disabled={loading}
          />
          <span className="input-help">
            Valor médio perdido quando um cliente ruim é aprovado (default + inadimplência)
          </span>
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
            onChange={(e) => onProfitChange(Number(e.target.value))}
            onBlur={onRecalculate}
            className="financial-input"
            disabled={loading}
          />
          <span className="input-help">
            Valor médio de lucro perdido quando um cliente bom é recusado
          </span>
        </div>
      </div>
      
      <div className="recalculate-section">
        <button className="recalculate-button" onClick={onRecalculate} disabled={loading}>
          {loading ? '⏳ Otimizando...' : '🔄 Recalcular Otimização'}
        </button>
      </div>
    </div>
  );
};

export default FinancialInputs;
