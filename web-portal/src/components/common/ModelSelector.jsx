import './ModelSelector.css';

const ModelSelector = ({ modelVersion, onModelChange, disabled = false }) => {
  const models = [
    { version: 'v1', badge: 'V1', name: 'Modelo Base', description: 'Features básicas' },
    { version: 'v2', badge: 'V2', name: 'Modelo Enriquecido', description: 'Features + Bureau Score' },
  ];

  return (
    <div className="model-selector">
      <h3>Selecione o Modelo</h3>
      <div className="model-buttons">
        {models.map(({ version, badge, name, description }) => (
          <button
            key={version}
            className={`model-button ${modelVersion === version ? 'active' : ''}`}
            onClick={() => onModelChange(version)}
            disabled={disabled}
          >
            <div className="model-badge">{badge}</div>
            <div className="model-name">{name}</div>
            <div className="model-description">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
