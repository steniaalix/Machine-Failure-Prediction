const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Sends machine parameters to the prediction API to check for failure risks.
 * @param {Object} data - Form data with machine parameters
 * @returns {Promise<Object>} API prediction response
 */
export async function predictFailure(data) {
  const formattedData = {
    type: data.type,
    air_temperature: parseFloat(data.air_temperature),
    process_temperature: parseFloat(data.process_temperature),
    rotational_speed: parseInt(data.rotational_speed, 10),
    torque: parseFloat(data.torque),
    tool_wear: parseFloat(data.tool_wear)
  };

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });

  if (!response.ok) {
    let errorDetail = 'API prediction request failed';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      errorDetail = `HTTP error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

/**
 * Checks the connection health status of the FastAPI backend.
 * @returns {Promise<boolean>} True if api is healthy, false otherwise
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Timeout after 3 seconds so check doesn't hang
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy';
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches machine model metadata and optimization parameters.
 * @returns {Promise<Object>} Model info metadata
 */
export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch model info');
  }

  return await response.json();
}
