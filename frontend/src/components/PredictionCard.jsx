import React from 'react';

/**
 * Reusable card representing a single failure prediction metric.
 * @param {Object} props
 * @param {string} props.name - Name of the failure (e.g., Tool Wear Failure)
 * @param {string} props.code - Short code (e.g., TWF)
 * @param {number} props.prediction - 1 for failure predicted, 0 otherwise
 * @param {number} props.probability - Failure probability (0.0 to 1.0)
 * @param {number} props.threshold - Optimized threshold (0.0 to 1.0)
 */
export default function PredictionCard({ name, code, prediction, probability, threshold }) {
  const isFailure = prediction === 1;
  const probPercent = (probability * 100).toFixed(1);
  const threshPercent = (threshold * 100).toFixed(1);
  const progressWidth = Math.min(Math.max(probability * 100, 0), 100);

  // Status colors & icon config
  const statusColor = isFailure ? 'var(--status-danger)' : 'var(--status-ok)';
  const statusBg = isFailure ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)';
  const statusBorder = isFailure ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';
  const progressColor = isFailure ? 'var(--status-danger)' : 'var(--status-ok)';
  const progressGlow = isFailure ? 'var(--status-danger-glow)' : 'var(--status-ok-glow)';

  return (
    <div 
      className="dashboard-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: `1px solid ${isFailure ? 'var(--status-danger)' : 'var(--border-color)'}`,
        boxShadow: isFailure ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
        position: 'relative'
      }}
    >
      {/* Top section: Header info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {name}
          </h3>
          <span 
            className="text-mono" 
            style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)', 
              fontWeight: 'bold',
              letterSpacing: '0.05em' 
            }}
          >
            {code}
          </span>
        </div>
        
        {/* Pulse dot for failures */}
        {isFailure && (
          <span 
            className="status-dot status-dot-red" 
            style={{ width: '8px', height: '8px', animation: 'blink 1s infinite' }}
          />
        )}
      </div>

      {/* Center status bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: statusBg,
          border: `1px solid ${statusBorder}`,
          color: statusColor,
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {isFailure ? (
          <>
            <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>FAILURE PREDICTED</span>
          </>
        ) : (
          <>
            <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>NO FAILURE PREDICTED</span>
          </>
        )}
      </div>

      {/* Progress Bar / Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Failure Probability</span>
          <span className="text-mono" style={{ fontWeight: 'bold', color: statusColor }}>
            {probPercent}%
          </span>
        </div>
        
        <div 
          style={{
            position: 'relative',
            height: '8px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            overflow: 'visible'
          }}
        >
          {/* Fill */}
          <div 
            style={{
              width: `${progressWidth}%`,
              height: '100%',
              backgroundColor: progressColor,
              borderRadius: '9999px',
              boxShadow: `0 0 8px ${progressGlow}`,
              transition: 'width 0.5s ease-out'
            }}
          />
          
          {/* Threshold Marker */}
          <div 
            style={{
              position: 'absolute',
              top: '-3px',
              bottom: '-3px',
              left: `${threshold * 100}%`,
              width: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 5px #ffffff',
              zIndex: 2,
              transform: 'translateX(-50%)'
            }}
            title={`Optimized Threshold: ${threshPercent}%`}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>0%</span>
          <span>Threshold: {threshPercent}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
