import './LoadingIndicator.css';

const LoadingIndicator = ({ message = 'Carregando...' }) => (
  <div className="loading-indicator">{message}</div>
);

export default LoadingIndicator;
