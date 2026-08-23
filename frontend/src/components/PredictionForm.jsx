import React, { useState } from 'react';

const INITIAL_FORM_STATE = {
  type: '',
  air_temperature: '',
  process_temperature: '',
  rotational_speed: '',
  torque: '',
  tool_wear: ''
};

const EXAMPLE_DATA = {
  type: 'L',
  air_temperature: '298.1',
  process_temperature: '308.6',
  rotational_speed: '1551',
  torque: '42.8',
  tool_wear: '0'
};

/**
 * Machine Parameters Input Form.
 * @param {Object} props
 * @param {boolean} props.isLoading - State of API call processing
 * @param {function} props.onSubmit - Function to trigger with form parameters
 * @param {function} props.onReset - Function to clear prediction results
 */
export default function PredictionForm({ isLoading, onSubmit, onReset }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFillExample = () => {
    setFormData(EXAMPLE_DATA);
    setErrors({});
  };

  const handleClear = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    onReset();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Machine Type is required';
    }

    const airTemp = parseFloat(formData.air_temperature);
    if (!formData.air_temperature) {
      newErrors.air_temperature = 'Air Temperature is required';
    } else if (isNaN(airTemp) || airTemp <= 0) {
      newErrors.air_temperature = 'Must be greater than 0 K';
    }

    const procTemp = parseFloat(formData.process_temperature);
    if (!formData.process_temperature) {
      newErrors.process_temperature = 'Process Temperature is required';
    } else if (isNaN(procTemp) || procTemp <= 0) {
      newErrors.process_temperature = 'Must be greater than 0 K';
    }

    const speed = parseInt(formData.rotational_speed, 10);
    if (!formData.rotational_speed) {
      newErrors.rotational_speed = 'Rotational Speed is required';
    } else if (isNaN(speed) || speed <= 0) {
      newErrors.rotational_speed = 'Must be greater than 0 RPM';
    }

    const torque = parseFloat(formData.torque);
    if (!formData.torque) {
      newErrors.torque = 'Torque is required';
    } else if (isNaN(torque) || torque <= 0) {
      newErrors.torque = 'Must be greater than 0 Nm';
    }

    const wear = parseFloat(formData.tool_wear);
    if (formData.tool_wear === '') {
      newErrors.tool_wear = 'Tool Wear is required';
    } else if (isNaN(wear) || wear < 0) {
      newErrors.tool_wear = 'Must be 0 or positive minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="dashboard-card animate-fade-in">
      <h2 className="card-title">
        {/* SVG Icon of clipboard list */}
        <svg style={{ width: '20px', height: '20px', color: 'var(--accent-blue)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
        Diagnostics Panel
      </h2>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Configure the technical specifications and current operating conditions of the machine tool to test for wear failure risk.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          
          {/* Machine Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="type">
              Machine Quality Type
              <span className="form-unit">[L/M/H]</span>
            </label>
            <select
              id="type"
              name="type"
              className="form-control"
              value={formData.type}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="" disabled>Select Type...</option>
              <option value="L">L (Low - 50% of machines)</option>
              <option value="M">M (Medium - 30% of machines)</option>
              <option value="H">H (High - 20% of machines)</option>
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          {/* Tool Wear */}
          <div className="form-group">
            <label className="form-label" htmlFor="tool_wear">
              Tool Wear Time
              <span className="form-unit">Minutes</span>
            </label>
            <input
              type="number"
              step="any"
              id="tool_wear"
              name="tool_wear"
              placeholder="e.g. 150"
              className="form-control"
              value={formData.tool_wear}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.tool_wear && <span className="error-text">{errors.tool_wear}</span>}
          </div>

          {/* Air Temperature */}
          <div className="form-group">
            <label className="form-label" htmlFor="air_temperature">
              Air Temperature
              <span className="form-unit">Kelvin (K)</span>
            </label>
            <input
              type="number"
              step="any"
              id="air_temperature"
              name="air_temperature"
              placeholder="e.g. 298.1"
              className="form-control"
              value={formData.air_temperature}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.air_temperature && <span className="error-text">{errors.air_temperature}</span>}
          </div>

          {/* Process Temperature */}
          <div className="form-group">
            <label className="form-label" htmlFor="process_temperature">
              Process Temperature
              <span className="form-unit">Kelvin (K)</span>
            </label>
            <input
              type="number"
              step="any"
              id="process_temperature"
              name="process_temperature"
              placeholder="e.g. 308.6"
              className="form-control"
              value={formData.process_temperature}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.process_temperature && <span className="error-text">{errors.process_temperature}</span>}
          </div>

          {/* Rotational Speed */}
          <div className="form-group">
            <label className="form-label" htmlFor="rotational_speed">
              Rotational Speed
              <span className="form-unit">RPM</span>
            </label>
            <input
              type="number"
              id="rotational_speed"
              name="rotational_speed"
              placeholder="e.g. 1551"
              className="form-control"
              value={formData.rotational_speed}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.rotational_speed && <span className="error-text">{errors.rotational_speed}</span>}
          </div>

          {/* Torque */}
          <div className="form-group">
            <label className="form-label" htmlFor="torque">
              Torque
              <span className="form-unit">Nm</span>
            </label>
            <input
              type="number"
              step="any"
              id="torque"
              name="torque"
              placeholder="e.g. 42.8"
              className="form-control"
              value={formData.torque}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.torque && <span className="error-text">{errors.torque}</span>}
          </div>

        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Analyzing machine condition...</span>
              </>
            ) : (
              <>
                {/* SVG Play/Lightning icon */}
                <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Predict Failure
              </>
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleFillExample}
            disabled={isLoading}
          >
            {/* SVG Document fill icon */}
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Example Data
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isLoading}
            style={{ minWidth: '80px' }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
