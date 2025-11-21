import './TabNavigation.css';

const TabNavigation = ({ activeView, onViewChange }) => {
  const tabs = [
    { id: 'simulator', icon: '📊', label: 'Simulador de Risco' },
    { id: 'individual', icon: '🔍', label: 'Análise Individual' },
  ];

  return (
    <div className="navigation-tabs">
      {tabs.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`tab-button ${activeView === id ? 'active' : ''}`}
          onClick={() => onViewChange(id)}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
