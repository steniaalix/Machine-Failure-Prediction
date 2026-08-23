import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import ErrorMessage from './components/ErrorMessage';
import { predictFailure, checkApiHealth, getModelInfo } from './services/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [modelMetadata, setModelMetadata] = useState(null);

  // Check backend server connection on startup
  const runHealthCheck = async () => {
    setApiStatus('checking');
    const isHealthy = await checkApiHealth();
    if (isHealthy) {
      setApiStatus('connected');
      // Fetch model metadata info once connected
      try {
        const metadata = await getModelInfo();
        setModelMetadata(metadata);
      } catch (err) {
        console.warn('Failed to load model metadata', err);
      }
    } else {
      setApiStatus('disconnected');
      setModelMetadata(null);
    }
  };

  useEffect(() => {
    runHealthCheck();

    // Check status periodically every 15 seconds
    const interval = setInterval(async () => {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await predictFailure(formData);
      setPredictionResult(result);
      
      // Update status to connected since we got a successful response
      setApiStatus('connected');
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during prediction.');
      setPredictionResult(null);
      
      // Re-run health check to update API status indicator
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    setErrorMessage(null);
  };

  return (
    <>
      <Header status={apiStatus} onCheckConnection={runHealthCheck} />

      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {/* Main page error notification */}
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />

        <div className="dashboard-grid">
          {/* Left Column: Input Form and Server Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PredictionForm 
              isLoading={isLoading} 
              onSubmit={handlePredict} 
              onReset={handleReset} 
            />

            {/* Model & ML details card */}
            <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="card-title" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {/* SVG Brain/Model info icon */}
                <svg style={{ width: '18px', height: '18px', color: 'var(--accent-blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Prediction Model Metadata
              </h3>
              
              {modelMetadata ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Algorithm</span>
                    <span className="text-mono" style={{ fontWeight: 600 }}>{modelMetadata.model}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Optimized Decision Boundary</span>
                    <span className="text-mono" style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{modelMetadata.optimized_threshold.toFixed(4)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>False Negative Penalty Cost</span>
                    <span className="text-mono" style={{ fontWeight: 600, color: 'var(--status-danger)' }}>${modelMetadata.false_negative_cost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>False Positive Penalty Cost</span>
                    <span className="text-mono" style={{ fontWeight: 600, color: 'var(--status-warning)' }}>${modelMetadata.false_positive_cost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Scikit-Learn Environment</span>
                    <span className="text-mono" style={{ fontWeight: 600 }}>v{modelMetadata.sklearn_version}</span>
                  </div>
                  
                  <div className="info-banner" style={{ marginTop: '0.5rem' }}>
                    {/* SVG Lightbulb icon */}
                    <svg className="info-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                      <line x1="9" y1="18" x2="15" y2="18" />
                      <line x1="10" y1="22" x2="14" y2="22" />
                    </svg>
                    <p className="info-banner-text">
                      The decision boundary is optimized to minimize industrial cost. A False Negative (missing a tool failure) carries a severe penalty of <strong>${modelMetadata.false_negative_cost.toLocaleString()}</strong>, whereas a False Positive (unnecessary check) costs only <strong>${modelMetadata.false_positive_cost.toLocaleString()}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {apiStatus === 'disconnected' 
                    ? 'Prediction server is offline. Metadata cannot be retrieved.' 
                    : 'Loading model optimization details from prediction server...'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Prediction Results Dashboard */}
          <div>
            {predictionResult ? (
              <PredictionResult result={predictionResult} />
            ) : (
              <div 
                className="dashboard-card animate-fade-in" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  textAlign: 'center', 
                  padding: '4rem 2rem',
                  borderStyle: 'dashed',
                  borderColor: 'var(--border-color)',
                  height: '100%',
                  minHeight: '400px'
                }}
              >
                {/* Visual Radar outline graphic */}
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '96px', 
                    height: '96px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <svg 
                    style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      borderRadius: '50%', 
                      border: '2px solid var(--accent-blue)', 
                      opacity: 0.2,
                      animation: 'spin 10s linear infinite'
                    }}
                  />
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Standby: Monitoring Inactive</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: '1.5' }}>
                  Please fill in the tool operational variables on the left diagnostics panel and click <strong>Predict Failure</strong> to execute the machine learning prediction.
                </p>
                
                {apiStatus === 'disconnected' && (
                  <div style={{ marginTop: '1.5rem', color: 'var(--status-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="status-dot status-dot-red"></span>
                    <span>Note: Predictor server is currently offline.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container footer-content">
          <span>&copy; 2026 Tool Wear Diagnostic Systems. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {apiStatus.toUpperCase()}</span>
            <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Type: Random Forest Classifier</span>
          </div>
        </div>
      </footer>
    </>
  );
}
