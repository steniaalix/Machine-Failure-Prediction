import React from 'react';
import PredictionCard from './PredictionCard';

const FAILURE_METADATA = {
  TWF: { name: 'Tool Wear Failure', code: 'TWF' },
  HDF: { name: 'Heat Dissipation Failure', code: 'HDF' },
  PWF: { name: 'Power Failure', code: 'PWF' },
  OSF: { name: 'Overstrain Failure', code: 'OSF' }
};

/**
 * Parses a single endpoint prediction response to map it back to its metadata.
 */
function parseSinglePrediction(result) {
  const resultText = result.result || '';
  let code = 'TWF';
  let name = 'Tool Wear Failure';

  if (resultText.toLowerCase().includes('heat')) {
    code = 'HDF';
    name = 'Heat Dissipation Failure';
  } else if (resultText.toLowerCase().includes('power')) {
    code = 'PWF';
    name = 'Power Failure';
  } else if (resultText.toLowerCase().includes('overstrain') || resultText.toLowerCase().includes('over strain')) {
    code = 'OSF';
    name = 'Overstrain Failure';
  }

  return {
    code,
    name,
    prediction: result.prediction,
    failure_probability: result.failure_probability,
    optimized_threshold: result.optimized_threshold
  };
}

export default function PredictionResult({ result }) {
  if (!result) return null;

  const isAggregate = !!result.predictions;
  let power = 0;
  let failuresDetected = 0;
  let statusText = '';
  let predictionList = [];

  if (isAggregate) {
    power = result.power;
    failuresDetected = result.machine_summary.failures_detected;
    statusText = result.machine_summary.status;

    // Convert predictions map into a list and append metadata names
    predictionList = Object.entries(result.predictions).map(([code, predData]) => ({
      code,
      name: FAILURE_METADATA[code]?.name || code,
      prediction: predData.prediction,
      failure_probability: predData.failure_probability,
      optimized_threshold: predData.optimized_threshold
    }));
  } else {
    // Single prediction parse
    power = result.power || 0;
    failuresDetected = result.prediction === 1 ? 1 : 0;
    statusText = failuresDetected > 0 ? 'Attention Required' : 'Machine Operating Normally';

    const parsed = parseSinglePrediction(result);
    predictionList = [parsed];
  }

  // Sort list of predictions by failure probability in descending order (highest risk first)
  const sortedPredictions = [...predictionList].sort(
    (a, b) => b.failure_probability - a.failure_probability
  );

  // Filter out which failure modes were explicitly predicted as positive failures (prediction === 1)
  const positiveFailures = predictionList.filter((p) => p.prediction === 1);

  const isCritical = failuresDetected > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. MACHINE HEALTH SUMMARY CARD */}
      <div 
        className="dashboard-card animate-fade-in"
        style={{
          border: `1px solid ${isCritical ? 'var(--status-danger)' : 'var(--status-ok)'}`,
          boxShadow: isCritical ? '0 4px 20px rgba(239, 68, 68, 0.15)' : '0 4px 20px rgba(16, 185, 129, 0.05)',
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(27, 38, 64, 0.3) 100%)'
        }}
      >
        <h2 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          {/* SVG Summary Clipboard icon */}
          <svg style={{ width: '20px', height: '20px', color: isCritical ? 'var(--status-danger)' : 'var(--status-ok)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Machine Health Summary
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Status Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div 
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isCritical ? 'var(--status-danger)' : 'var(--status-ok)',
                animation: isCritical ? 'blink 2.5s infinite' : 'none'
              }}
            >
              {isCritical ? (
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Operational Status
              </span>
              <h3 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 800, 
                  margin: 0, 
                  color: isCritical ? 'var(--status-danger)' : 'var(--status-ok)' 
                }}
              >
                {statusText}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Failures Detected</span>
              <div className="text-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: isCritical ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                {failuresDetected}
              </div>
            </div>
            
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calculated Power</span>
              <div className="text-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                {power.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>W</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RISK PRIORITIZATION ALERT BOX */}
      <div 
        className="dashboard-card animate-fade-in"
        style={{
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(17, 26, 48, 0.4)'
        }}
      >
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Radar / Alert Bell Icon */}
          <svg style={{ width: '16px', height: '16px', color: isCritical ? 'var(--status-danger)' : 'var(--status-ok)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Risk Prioritization &amp; Alerts
        </h3>
        
        {isCritical ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              The system has flagged immediate maintenance actions needed. Please verify:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {positiveFailures.map((pf) => (
                <div 
                  key={pf.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--status-danger)',
                    fontWeight: 600,
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--status-danger)'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>•</span>
                  <span><strong>{pf.name}</strong> ({pf.code}) predicted (Risk probability: {(pf.failure_probability * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div 
            style={{
              fontSize: '0.85rem',
              color: 'var(--status-ok)',
              fontWeight: 500,
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '3px solid var(--status-ok)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg style={{ width: '16px', height: '16px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>No immediate machine failure risks detected. All probabilities are below model thresholds.</span>
          </div>
        )}
      </div>

      {/* 3. FAILURE PREDICTION CARDS SECTION */}
      <div>
        <h3 
          style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Failure Risk Analysis</span>
          <span style={{ fontSize: '0.75rem', textTransform: 'none', fontWeight: 'normal', color: 'var(--text-muted)' }}>
            Sorted by highest risk probability
          </span>
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {sortedPredictions.map((pred) => (
            <PredictionCard
              key={pred.code}
              name={pred.name}
              code={pred.code}
              prediction={pred.prediction}
              probability={pred.failure_probability}
              threshold={pred.optimized_threshold}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
}
