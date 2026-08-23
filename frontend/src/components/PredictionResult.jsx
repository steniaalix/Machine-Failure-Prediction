import React from 'react';
import ProbabilityGauge from './ProbabilityGauge';

/**
 * Prediction Results Dashboard.
 * Displays details of the machine wear diagnostic analysis.
 * @param {Object} props
 * @param {Object} props.result - API response containing prediction results
 */
export default function PredictionResult({ result }) {
  if (!result) return null;

  const {
    prediction,
    result: apiResultMessage,
    failure_probability,
    optimized_threshold,
    power,
    risk_level,
    cost_strategy
  } = result;

  const isFailurePredicted = prediction === 1;

  // Calculate prediction confidence (distance between prob and optimized threshold)
  // Format as percentage: e.g. Math.abs(prob - thresh) * 100
  const confidenceDistance = Math.abs(failure_probability - optimized_threshold);
  const confidencePercent = (confidenceDistance * 100).toFixed(1);

  return (
    <div className="dashboard-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 className="card-title">
        {/* SVG Icon of chart/dashboard */}
        <svg style={{ width: '20px', height: '20px', color: 'var(--accent-blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="21" x2="9" y2="9" />
          <line x1="9" y1="9" x2="21" y2="9" />
          <line x1="15" y1="9" x2="15" y2="21" />
        </svg>
        Diagnostic Results
      </h2>

      {/* Prediction Status Banner */}
      {isFailurePredicted ? (
        <div className="result-status-card status-card-danger">
          <div className="status-card-icon status-card-icon-danger">
            {/* SVG Warning Icon */}
            <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="status-card-body">
            <h3 className="status-card-title" style={{ color: 'var(--status-danger)' }}>Tool Wear Failure Detected</h3>
            <p className="status-card-text">{apiResultMessage}</p>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fca5a5', marginTop: '0.25rem' }}>
              ⚠️ IMMEDIATE ACTION REQUIRED: Scheduled or urgent maintenance may be needed to prevent tool breakage.
            </span>
          </div>
        </div>
      ) : (
        <div className="result-status-card status-card-ok">
          <div className="status-card-icon status-card-icon-ok">
            {/* SVG Check Shield Icon */}
            <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="status-card-body">
            <h3 className="status-card-title" style={{ color: 'var(--status-ok)' }}>Machine Operating Normally</h3>
            <p className="status-card-text">{apiResultMessage}</p>
            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
              ✓ All metrics are within safe cost-optimized operating boundaries.
            </span>
          </div>
        </div>
      )}

      {/* Visual Probability Analyzer */}
      <ProbabilityGauge probability={failure_probability} threshold={optimized_threshold} />

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        
        {/* Failure Probability card */}
        <div className="metric-card">
          <span className="metric-label">Failure Probability</span>
          <span className="metric-value">
            {(failure_probability * 100).toFixed(2)}
            <span className="metric-unit">%</span>
          </span>
          <span className="metric-footer">Based on Random Forest model</span>
        </div>

        {/* Optimized Threshold card */}
        <div className="metric-card">
          <span className="metric-label">Decision Threshold</span>
          <span className="metric-value">
            {optimized_threshold.toFixed(4)}
          </span>
          <span className="metric-footer">Cost-optimized threshold</span>
        </div>

        {/* Power card */}
        <div className="metric-card">
          <span className="metric-label">Calculated Power</span>
          <span className="metric-value">
            {power.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="metric-unit">W</span>
          </span>
          <span className="metric-footer">Torque × Speed (Nm·RPM)</span>
        </div>

        {/* Prediction Output card */}
        <div className="metric-card">
          <span className="metric-label">System Decision</span>
          <span 
            className="metric-value" 
            style={{ color: isFailurePredicted ? 'var(--status-danger)' : 'var(--status-ok)' }}
          >
            {prediction}
          </span>
          <span className="metric-footer">
            {isFailurePredicted ? 'CRITICAL RISK' : 'OPERATIONAL'}
          </span>
        </div>

      </div>

      {/* Interface-level Confidence distance indicator */}
      <div className="metric-card" style={{ backgroundColor: 'rgba(27, 38, 64, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="metric-label">Prediction Margin Confidence</span>
          <span className="text-mono" style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
            {confidencePercent}%
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.3' }}>
          <strong>Confidence Margin Indicator:</strong> This represents the statistical distance ({confidenceDistance.toFixed(3)}) between the failure probability and the cost-optimized threshold. A larger distance represents higher margin stability. Note: This is an interface indicator, not a model probability guarantee.
        </p>
      </div>

      {/* Extra model info panel (Risk Level, Cost strategy) */}
      <div className="metadata-panel">
        <div className="metadata-item">
          <span className="metadata-label">Operational Risk</span>
          <span 
            className="metadata-value text-mono"
            style={{ 
              color: risk_level === 'HIGH' ? 'var(--status-danger)' : 
                     risk_level === 'MEDIUM' ? 'var(--status-warning)' : 'var(--status-ok)'
            }}
          >
            {risk_level || 'UNKNOWN'}
          </span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-label">Optimization Strategy</span>
          <span className="metadata-value" style={{ fontSize: '0.8rem' }}>
            {cost_strategy || 'Cost-Optimized Model'}
          </span>
        </div>
      </div>

    </div>
  );
}
