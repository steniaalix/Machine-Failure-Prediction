const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Format raw form data into standard types for backend request.
 */
function formatRequestData(data) {
  return {
    type: data.type,
    air_temperature: parseFloat(data.air_temperature),
    process_temperature: parseFloat(data.process_temperature),
    rotational_speed: parseInt(data.rotational_speed, 10),
    torque: parseFloat(data.torque),
    tool_wear: parseFloat(data.tool_wear)
  };
}

/**
 * Handles fetch response and extracts JSON or throws an error.
 */
async function handleResponse(response, contextMessage) {
  if (!response.ok) {
    let errorDetail = `${contextMessage} failed`;
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
 * Predicts all failure types using the main aggregate model endpoint.
 * POST /predict/all
 */
export async function predictAll(data) {
  const formattedData = formatRequestData(data);
  const response = await fetch(`${API_BASE_URL}/predict/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });
  return handleResponse(response, 'All-model prediction diagnostic');
}

/**
 * Predicts Tool Wear Failure (TWF) only.
 * POST /predict/twf
 */
export async function predictTwf(data) {
  const formattedData = formatRequestData(data);
  const response = await fetch(`${API_BASE_URL}/predict/twf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });
  return handleResponse(response, 'Tool Wear Failure (TWF) prediction');
}

/**
 * Predicts Heat Dissipation Failure (HDF) only.
 * POST /predict/hdf
 */
export async function predictHdf(data) {
  const formattedData = formatRequestData(data);
  const response = await fetch(`${API_BASE_URL}/predict/hdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });
  return handleResponse(response, 'Heat Dissipation Failure (HDF) prediction');
}

/**
 * Predicts Power Failure (PWF) only.
 * POST /predict/pwf
 */
export async function predictPwf(data) {
  const formattedData = formatRequestData(data);
  const response = await fetch(`${API_BASE_URL}/predict/pwf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });
  return handleResponse(response, 'Power Failure (PWF) prediction');
}

/**
 * Predicts Overstrain Failure (OSF) only.
 * POST /predict/osf
 */
export async function predictOsf(data) {
  const formattedData = formatRequestData(data);
  const response = await fetch(`${API_BASE_URL}/predict/osf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedData)
  });
  return handleResponse(response, 'Overstrain Failure (OSF) prediction');
}

/**
 * Checks connectivity health status of the FastAPI backend.
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

export { API_BASE_URL };
