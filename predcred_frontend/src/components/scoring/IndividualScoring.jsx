import { useScoring } from '../../hooks/useScoring';
import ErrorMessage from '../common/ErrorMessage';
import './IndividualScoring.css';
import ModelToggle from './ModelToggle';
import ScoreResult from './ScoreResult';
import ScoringForm from './ScoringForm';

const IndividualScoring = () => {
  const {
    modelVersion,
    loading,
    error,
    result,
    formData,
    handleFieldChange,
    handleModelChange,
    submitScore,
  } = useScoring();

  return (
    <div className="individual-scoring-container">
      <div className="scoring-header">
        <h2>Análise Individual de Risco de Crédito</h2>
        <p className="scoring-subtitle">
          Preencha os dados do contrato para obter uma análise de risco personalizada
        </p>
      </div>

      <ModelToggle modelVersion={modelVersion} onModelChange={handleModelChange} />

      <ScoringForm
        formData={formData}
        modelVersion={modelVersion}
        loading={loading}
        onChange={handleFieldChange}
        onSubmit={submitScore}
      />

      <ErrorMessage message={error} />
      <ScoreResult result={result} />
    </div>
  );
};

export default IndividualScoring;
