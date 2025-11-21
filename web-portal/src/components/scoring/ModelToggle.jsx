import './ModelToggle.css';

const ModelToggle = ({ modelVersion, onModelChange }) => {
  return (
    <div className="model-selector-inline">
      <label>Modelo de Análise:</label>
      <div className="model-toggle">
        <button
          type="button"
          className={modelVersion === 'v1' ? 'active' : ''}
          onClick={() => onModelChange('v1')}
        >
          V1 (Base)
        </button>
        <button
          type="button"
          className={modelVersion === 'v2' ? 'active' : ''}
          onClick={() => onModelChange('v2')}
        >
          V2 (Enriquecido)
        </button>
      </div>
    </div>
  );
};

export default ModelToggle;
