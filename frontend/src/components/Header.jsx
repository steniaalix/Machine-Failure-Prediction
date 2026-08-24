import React from 'react';
import ApiStatusIndicator from './ApiStatusIndicator';

/**
 * App Header Component containing logo, title, and API status indicator.
 * @param {Object} props
 * @param {string} props.status - The API connectivity status ("connected" | "disconnected" | "checking")
 * @param {function} props.onCheckConnection - Function to manually trigger health check
 */
export default function Header({ status, onCheckConnection }) {
  return (
    <header className="app-header">
      <div className="container header-container">
        <div className="header-brand">
          {/* Custom SVG logo showing a machine gear integrated with a neural pulse wave */}
          <svg 
            className="logo-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 8v8" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M8 12h8" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          
          <div className="header-titles">
            <h1 className="header-title" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}>
              Machine Failure Prediction System
            </h1>
            <span className="header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              AI-Powered Predictive Maintenance
            </span>
          </div>
        </div>

        <ApiStatusIndicator status={status} onCheck={onCheckConnection} />
      </div>
    </header>
  );
}
