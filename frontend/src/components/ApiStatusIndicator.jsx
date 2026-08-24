import React from 'react';

/**
 * Status Indicator Badge for API Server Connectivity.
 * @param {Object} props
 * @param {string} props.status - "connected" | "disconnected" | "checking"
 * @param {function} props.onCheck - Triggered on click to re-check connectivity
 */
export default function ApiStatusIndicator({ status, onCheck }) {
  let label = 'Checking API...';
  let dotClass = 'status-dot-yellow';
  
  if (status === 'connected') {
    label = 'API Connected';
    dotClass = 'status-dot-green';
  } else if (status === 'disconnected') {
    label = 'API Offline';
    dotClass = 'status-dot-red';
  }

  return (
    <div 
      className="api-status-badge"
      title="Click to check connection status"
      onClick={onCheck}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span className={`status-dot ${dotClass}`}></span>
      <span className="status-label" style={{ fontSize: '0.75rem', letterSpacing: '0.02em' }}>{label}</span>
      <svg 
        style={{ width: '12px', height: '12px', opacity: 0.6, marginLeft: '2px' }}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    </div>
  );
}
