import React from 'react';

/**
 * Probability Gauge / Progress Bar Visualizer.
 * Displays failure probability vs optimized decision threshold.
 * @param {Object} props
 * @param {number} props.probability - Failure probability (0.0 to 1.0)
 * @param {number} props.threshold - Optimized decision threshold (0.0 to 1.0)
 */
export default function ProbabilityGauge({ probability, threshold }) {
  const probPercent = Math.min(Math.max(probability * 100, 0), 100);
  const threshPercent = Math.min(Math.max(threshold * 100, 0), 100);
  
  const isOverThreshold = probability >= threshold;
  
  // Set filled color dynamic based on whether probability is above or below threshold
  const fillColor = isOverThreshold 
    ? 'var(--status-danger)' 
    : 'var(--status-ok)';
  
  const glowColor = isOverThreshold 
    ? 'var(--status-danger-glow)' 
    : 'var(--status-ok-glow)';

  return (
    <div className="probability-gauge-container">
      <div className="gauge-header">
        <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Signal/Bar graph icon */}
          <svg style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Failure Probability Risk Analyzer
        </span>
        <span 
          className="text-mono" 
          style={{ 
            fontWeight: 700, 
            color: isOverThreshold ? 'var(--status-danger)' : 'var(--status-ok)',
            fontSize: '1.05rem'
          }}
        >
          {probPercent.toFixed(1)}%
        </span>
      </div>

      <div className="gauge-track-container">
        {/* Fill Indicator */}
        <div 
          className="gauge-fill"
          style={{ 
            width: `${probPercent}%`,
            backgroundColor: fillColor,
            boxShadow: `0 0 10px ${glowColor}`
          }}
        />

        {/* Threshold Cut-off Line Marker */}
        <div 
          className="gauge-marker"
          style={{ left: `${threshPercent}%` }}
        >
          <div className="gauge-marker-label">
            TH: {threshPercent.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="gauge-legend">
        <span>0% (Safe)</span>
        <span 
          style={{ 
            color: isOverThreshold ? 'var(--status-danger)' : 'var(--text-secondary)',
            fontWeight: isOverThreshold ? 'bold' : 'normal'
          }}
        >
          {isOverThreshold ? 'CRITICAL LIMIT EXCEEDED' : 'Within Normal Bounds'}
        </span>
        <span>100% (Failure)</span>
      </div>
    </div>
  );
}
