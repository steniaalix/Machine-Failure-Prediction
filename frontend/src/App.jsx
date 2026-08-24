import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import ErrorMessage from './components/ErrorMessage';
import { predictAll, predictTwf, predictHdf, predictPwf, predictOsf, checkApiHealth } from './services/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check backend server connection on startup
  const runHealthCheck = async () => {
    setApiStatus('checking');
    const isHealthy = await checkApiHealth();
    setApiStatus(isHealthy ? 'connected' : 'disconnected');
  };

  useEffect(() => {
    runHealthCheck();

    // Check status periodically every 10 seconds
    const interval = setInterval(async () => {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? 'connected' : 'disconnected');
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    const { diagnostic_scope, ...inputData } = formData;
    
    try {
      let result;
      if (diagnostic_scope === 'all') {
        result = await predictAll(inputData);
      } else if (diagnostic_scope === 'twf') {
        result = await predictTwf(inputData);
      } else if (diagnostic_scope === 'hdf') {
        result = await predictHdf(inputData);
      } else if (diagnostic_scope === 'pwf') {
        result = await predictPwf(inputData);
      } else if (diagnostic_scope === 'osf') {
        result = await predictOsf(inputData);
      } else {
        result = await predictAll(inputData);
      }
      
      setPredictionResult(result);
      setApiStatus('connected');
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected network error occurred during prediction.');
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

      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* HERO / INTRODUCTION SECTION */}
        <section 
          className="animate-fade-in"
          style={{ 
            textAlign: 'center', 
            maxWidth: '800px', 
            margin: '0 auto 0.5rem auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Predict Machine Failures Before They Happen
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Enter machine operating parameters to analyze potential failure risks using machine learning models.
          </p>
        </section>

        {/* ERROR NOTIFICATION PANEL */}
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />

        {/* MAIN DASHBOARD CONTAINER */}
        <div className="dashboard-grid">
          
          {/* Left Column: Diagnostics Input & Model Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Input Form */}
            <PredictionForm 
              isLoading={isLoading} 
              onSubmit={handlePredict} 
              onReset={handleReset} 
            />

            {/* Model Architecture & Cost Optimization details card */}
            <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="card-title" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {/* SVG Brain Icon */}
                <svg style={{ width: '18px', height: '18px', color: 'var(--accent-blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Cost-Aware ML Model Strategy
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Model Type</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>Random Forest Classifier</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Optimization Strategy</span>
                  <span className="text-mono" style={{ fontWeight: 600, color: 'var(--status-ok)' }}>Cost-Sensitive Thresholds</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>False Negative Penalty Cost</span>
                  <span className="text-mono" style={{ fontWeight: 600, color: 'var(--status-danger)' }}>$15,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>False Positive Penalty Cost</span>
                  <span className="text-mono" style={{ fontWeight: 600, color: 'var(--status-warning)' }}>$500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Diagnostic Coverage</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>TWF, HDF, PWF, OSF</span>
                </div>
                
                <div className="info-banner" style={{ marginTop: '0.5rem' }}>
                  {/* SVG Lightbulb icon */}
                  <svg className="info-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                    <line x1="9" y1="18" x2="15" y2="18" />
                    <line x1="10" y1="22" x2="14" y2="22" />
                  </svg>
                  <p className="info-banner-text">
                    Models use custom decision boundaries optimized to minimize industrial cost. A False Negative (missing a critical tool wear or heat failure) carries a severe penalty of <strong>$15,000</strong>, whereas a False Positive (unnecessary maintenance check) costs only <strong>$500</strong>. Thresholds are optimized accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prediction Results Dashboard */}
          <div>
            {isLoading ? (
              <div 
                className="dashboard-card animate-fade-in" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  textAlign: 'center', 
                  padding: '5rem 2rem',
                  height: '100%',
                  minHeight: '450px',
                  gap: '1.5rem'
                }}
              >
                <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }}></span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analyzing Machine Data...</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: '1.5', margin: '0 auto' }}>
                    Running diagnostics scanner, calculating power metrics, and evaluating failure risk boundaries.
                  </p>
                </div>
              </div>
            ) : predictionResult ? (
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
                  padding: '5rem 2rem',
                  borderStyle: 'dashed',
                  borderColor: 'var(--border-color)',
                  height: '100%',
                  minHeight: '450px'
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
                      animation: 'spin 12s linear infinite'
                    }}
                  />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Standby: Monitoring Inactive</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: '1.5', margin: 0 }}>
                  Enter machine parameters and run an analysis to view failure predictions.
                </p>
                
                {apiStatus === 'disconnected' && (
                  <div style={{ marginTop: '1.5rem', color: 'var(--status-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="status-dot status-dot-red"></span>
                    <span>Note: Prediction service is currently offline.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container footer-content">
          <span>&copy; 2026 Machine Failure Prediction System. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {apiStatus.toUpperCase()}</span>
            <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engine: FastAPI &amp; Scikit-Learn</span>
          </div>
        </div>
      </footer>
    </>
  );
}
