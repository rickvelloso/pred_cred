import FormField from './FormField';
import './ScoringForm.css';

const PERSONAL_FIELDS = [
  { id: 'Age', label: 'Idade', type: 'number', min: 18, max: 100 },
  {
    id: 'Education',
    label: 'Escolaridade',
    type: 'select',
    options: [
      { value: 'High School', label: 'Ensino Médio' },
      { value: "Bachelor's", label: 'Graduação' },
      { value: "Master's", label: 'Mestrado' },
      { value: 'PhD', label: 'Doutorado' },
    ],
  },
  {
    id: 'MaritalStatus',
    label: 'Estado Civil',
    type: 'select',
    options: [
      { value: 'Single', label: 'Solteiro(a)' },
      { value: 'Married', label: 'Casado(a)' },
      { value: 'Divorced', label: 'Divorciado(a)' },
    ],
  },
  {
    id: 'HasDependents',
    label: 'Possui Dependentes?',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Sim' },
      { value: 'No', label: 'Não' },
    ],
  },
];

const FINANCIAL_FIELDS = [
  { id: 'Income', label: 'Renda Anual (R$)', type: 'number', min: 0, step: 0.01 },
  {
    id: 'EmploymentType',
    label: 'Tipo de Emprego',
    type: 'select',
    options: [
      { value: 'Full-time', label: 'Tempo Integral' },
      { value: 'Part-time', label: 'Meio Período' },
      { value: 'Self-employed', label: 'Autônomo' },
      { value: 'Unemployed', label: 'Desempregado' },
    ],
  },
  { id: 'MonthsEmployed', label: 'Meses de Emprego', type: 'number', min: 0 },
  { id: 'DTIRatio', label: 'DTI Ratio (0-1)', type: 'number', min: 0, max: 1, step: 0.01 },
  {
    id: 'HasMortgage',
    label: 'Possui Hipoteca?',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Sim' },
      { value: 'No', label: 'Não' },
    ],
  },
];

const LOAN_FIELDS = [
  { id: 'LoanAmount', label: 'Valor do Empréstimo (R$)', type: 'number', min: 0, step: 0.01 },
  {
    id: 'LoanPurpose',
    label: 'Finalidade',
    type: 'select',
    options: [
      { value: 'Auto', label: 'Automóvel' },
      { value: 'Business', label: 'Negócio' },
      { value: 'Education', label: 'Educação' },
      { value: 'Home', label: 'Casa' },
      { value: 'Other', label: 'Outro' },
    ],
  },
  { id: 'LoanTerm', label: 'Prazo (meses)', type: 'number', min: 1 },
  { id: 'InterestRate', label: 'Taxa de Juros (%)', type: 'number', min: 0, step: 0.1 },
  {
    id: 'HasCoSigner',
    label: 'Possui Avalista?',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Sim' },
      { value: 'No', label: 'Não' },
    ],
  },
];

const CREDIT_FIELDS = [
  { id: 'CreditScore', label: 'Credit Score', type: 'number', min: 300, max: 850 },
  { id: 'NumCreditLines', label: 'Linhas de Crédito Ativas', type: 'number', min: 0 },
];

const ScoringForm = ({ formData, modelVersion, loading, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="scoring-form">
      <fieldset>
        <legend>📋 Dados Pessoais</legend>
        <div className="form-grid">
          {PERSONAL_FIELDS.map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={onChange} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>💰 Dados Financeiros</legend>
        <div className="form-grid">
          {FINANCIAL_FIELDS.map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={onChange} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>🏦 Dados do Empréstimo</legend>
        <div className="form-grid">
          {LOAN_FIELDS.map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={onChange} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>📊 Histórico de Crédito</legend>
        <div className="form-grid">
          {CREDIT_FIELDS.map(field => (
            <FormField key={field.id} field={field} value={formData[field.id]} onChange={onChange} />
          ))}
          {modelVersion === 'v2' && (
            <div className="form-field form-field-highlight">
              <label htmlFor="score_bureau">
                Score Bureau ⭐<span className="field-badge">V2</span>
              </label>
              <input
                type="number"
                id="score_bureau"
                name="score_bureau"
                value={formData.score_bureau}
                onChange={onChange}
                required
                min="300"
                max="950"
              />
            </div>
          )}
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Analisando...
            </>
          ) : (
            <>🔍 Analisar Risco de Crédito</>
          )}
        </button>
      </div>
    </form>
  );
};

export default ScoringForm;
