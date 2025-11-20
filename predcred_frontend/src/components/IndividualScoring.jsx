import axios from 'axios';
import { useState } from 'react';
import './IndividualScoring.css';
import ScoreResult from './ScoreResult';

const API_URL = 'https://predcred-api.onrender.com';

function IndividualScoring() {
  const [modelVersion, setModelVersion] = useState('v2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    Age: 32,
    Income: 65000.0,
    LoanAmount: 200000.0,
    CreditScore: 710,
    MonthsEmployed: 48,
    NumCreditLines: 3,
    InterestRate: 12.5,
    LoanTerm: 36,
    DTIRatio: 0.25,
    Education: "Bachelor's",
    EmploymentType: 'Full-time',
    MaritalStatus: 'Married',
    HasMortgage: 'Yes',
    HasDependents: 'No',
    LoanPurpose: 'Home',
    HasCoSigner: 'No',
    score_bureau: 720
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Converter para número se for campo numérico
    let processedValue = value;
    if (type === 'number') {
      processedValue = name === 'DTIRatio' || name === 'InterestRate' || name === 'Income' || name === 'LoanAmount'
        ? parseFloat(value)
        : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleModelChange = (version) => {
    setModelVersion(version);
    setResult(null); // Limpa resultado ao trocar modelo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const endpoint = modelVersion === 'v1' ? '/score/v1' : '/score/v2';
      
      // Preparar payload
      let payload = { ...formData };
      
      // Se for V1, remover score_bureau
      if (modelVersion === 'v1') {
        delete payload.score_bureau;
      }

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        timeout: 30000
      });

      setResult(response.data);
    } catch (err) {
      console.error('Erro ao enviar scoring:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Timeout: O servidor demorou muito para responder.');
      } else if (err.response) {
        setError(`Erro ${err.response.status}: ${err.response.data?.detail || 'Erro desconhecido'}`);
      } else {
        setError('Falha ao conectar com a API. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="individual-scoring-container">
      <div className="scoring-header">
        <h2>Análise Individual de Risco de Crédito</h2>
        <p className="scoring-subtitle">
          Preencha os dados do contrato para obter uma análise de risco personalizada
        </p>
      </div>

      {/* Seletor de Modelo */}
      <div className="model-selector-inline">
        <label>Modelo de Análise:</label>
        <div className="model-toggle">
          <button
            type="button"
            className={modelVersion === 'v1' ? 'active' : ''}
            onClick={() => handleModelChange('v1')}
          >
            V1 (Base)
          </button>
          <button
            type="button"
            className={modelVersion === 'v2' ? 'active' : ''}
            onClick={() => handleModelChange('v2')}
          >
            V2 (Enriquecido)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="scoring-form">
        {/* Seção: Dados Pessoais */}
        <fieldset>
          <legend>📋 Dados Pessoais</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="Age">Idade</label>
              <input
                type="number"
                id="Age"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                required
                min="18"
                max="100"
              />
            </div>

            <div className="form-field">
              <label htmlFor="Education">Escolaridade</label>
              <select
                id="Education"
                name="Education"
                value={formData.Education}
                onChange={handleChange}
                required
              >
                <option value="High School">Ensino Médio</option>
                <option value="Bachelor's">Graduação</option>
                <option value="Master's">Mestrado</option>
                <option value="PhD">Doutorado</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="MaritalStatus">Estado Civil</label>
              <select
                id="MaritalStatus"
                name="MaritalStatus"
                value={formData.MaritalStatus}
                onChange={handleChange}
                required
              >
                <option value="Single">Solteiro(a)</option>
                <option value="Married">Casado(a)</option>
                <option value="Divorced">Divorciado(a)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="HasDependents">Possui Dependentes?</label>
              <select
                id="HasDependents"
                name="HasDependents"
                value={formData.HasDependents}
                onChange={handleChange}
                required
              >
                <option value="Yes">Sim</option>
                <option value="No">Não</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Seção: Dados Financeiros */}
        <fieldset>
          <legend>💰 Dados Financeiros</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="Income">Renda Anual (R$)</label>
              <input
                type="number"
                id="Income"
                name="Income"
                value={formData.Income}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label htmlFor="EmploymentType">Tipo de Emprego</label>
              <select
                id="EmploymentType"
                name="EmploymentType"
                value={formData.EmploymentType}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Tempo Integral</option>
                <option value="Part-time">Meio Período</option>
                <option value="Self-employed">Autônomo</option>
                <option value="Unemployed">Desempregado</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="MonthsEmployed">Meses de Emprego</label>
              <input
                type="number"
                id="MonthsEmployed"
                name="MonthsEmployed"
                value={formData.MonthsEmployed}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="DTIRatio">DTI Ratio (0-1)</label>
              <input
                type="number"
                id="DTIRatio"
                name="DTIRatio"
                value={formData.DTIRatio}
                onChange={handleChange}
                required
                min="0"
                max="1"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label htmlFor="HasMortgage">Possui Hipoteca?</label>
              <select
                id="HasMortgage"
                name="HasMortgage"
                value={formData.HasMortgage}
                onChange={handleChange}
                required
              >
                <option value="Yes">Sim</option>
                <option value="No">Não</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Seção: Dados do Empréstimo */}
        <fieldset>
          <legend>🏦 Dados do Empréstimo</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="LoanAmount">Valor do Empréstimo (R$)</label>
              <input
                type="number"
                id="LoanAmount"
                name="LoanAmount"
                value={formData.LoanAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label htmlFor="LoanPurpose">Finalidade</label>
              <select
                id="LoanPurpose"
                name="LoanPurpose"
                value={formData.LoanPurpose}
                onChange={handleChange}
                required
              >
                <option value="Auto">Automóvel</option>
                <option value="Business">Negócio</option>
                <option value="Education">Educação</option>
                <option value="Home">Casa</option>
                <option value="Other">Outro</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="LoanTerm">Prazo (meses)</label>
              <input
                type="number"
                id="LoanTerm"
                name="LoanTerm"
                value={formData.LoanTerm}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-field">
              <label htmlFor="InterestRate">Taxa de Juros (%)</label>
              <input
                type="number"
                id="InterestRate"
                name="InterestRate"
                value={formData.InterestRate}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-field">
              <label htmlFor="HasCoSigner">Possui Avalista?</label>
              <select
                id="HasCoSigner"
                name="HasCoSigner"
                value={formData.HasCoSigner}
                onChange={handleChange}
                required
              >
                <option value="Yes">Sim</option>
                <option value="No">Não</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Seção: Histórico de Crédito */}
        <fieldset>
          <legend>📊 Histórico de Crédito</legend>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="CreditScore">Credit Score</label>
              <input
                type="number"
                id="CreditScore"
                name="CreditScore"
                value={formData.CreditScore}
                onChange={handleChange}
                required
                min="300"
                max="850"
              />
            </div>

            <div className="form-field">
              <label htmlFor="NumCreditLines">Linhas de Crédito Ativas</label>
              <input
                type="number"
                id="NumCreditLines"
                name="NumCreditLines"
                value={formData.NumCreditLines}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            {/* Campo condicional: score_bureau apenas para V2 */}
            {modelVersion === 'v2' && (
              <div className="form-field form-field-highlight">
                <label htmlFor="score_bureau">
                  Score Bureau ⭐
                  <span className="field-badge">V2</span>
                </label>
                <input
                  type="number"
                  id="score_bureau"
                  name="score_bureau"
                  value={formData.score_bureau}
                  onChange={handleChange}
                  required={modelVersion === 'v2'}
                  min="300"
                  max="950"
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Botão de Submissão */}
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Analisando...
              </>
            ) : (
              <>
                🔍 Analisar Risco de Crédito
              </>
            )}
          </button>
        </div>

        {/* Exibir Erro */}
        {error && (
          <div className="error-message">
            <strong>⚠️ Erro:</strong> {error}
          </div>
        )}
      </form>

      {/* Exibir Resultado */}
      <ScoreResult result={result} />
    </div>
  );
}

export default IndividualScoring;
