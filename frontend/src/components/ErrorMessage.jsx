import React from 'react';

/**
 * Custom Error Alert box component.
 * @param {Object} props
 * @param {string} props.message - The error message text to display
 * @param {function} props.onClose - Optional callback to clear error state
 */
export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  // Enhance generic network errors to make them more helpful for FastAPI backend connection issues
  const isConnectionError = message.toLowerCase().includes('failed to fetch') || 
                            message.toLowerCase().includes('networkerror') ||
                            message.toLowerCase().includes('unable to connect');

  const displayTitle = isConnectionError 
    ? 'Prediction Server Unreachable' 
    : 'Execution Error';

  const displayMessage = isConnectionError
    ? 'Unable to connect to the prediction server. Make sure the FastAPI backend is running on port 8001 (e.g. via uvicorn app.main:app --port 8001 --reload) and your local network allows local CORS traffic.'
    : message;

  return (
    <div className="error-alert-box animate-fade-in">
      {/* SVG Warning Icon */}
      <svg className="error-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      
      <div className="error-alert-content">
        <h4 className="error-alert-title">{displayTitle}</h4>
        <p className="error-alert-desc">{displayMessage}</p>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          title="Clear error"
        >
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
