import './ColdStartBanner.css';

const ColdStartBanner = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="cold-start-banner">
      <div className="cold-start-content">
        <svg className="info-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="cold-start-text">
          <strong>⚡ Free Tier Hosting Notice:</strong> The backend is hosted on Render's free tier.
          Initial load may take 30-60 seconds due to cold start. This is a hosting limitation, not a software issue.
        </div>
        <button className="cold-start-close" onClick={onClose} aria-label="Close notification">
          ✕
        </button>
      </div>
    </div>
  );
};

export default ColdStartBanner;
