const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) || (typeof data === 'string' ? data : response.statusText);
    const error = new Error(errorMsg || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return await handleResponse(res);
  } catch (err) {
    err.baseUrl = API_BASE_URL;
    throw err;
  }
}

export async function predictBusiness(businessData) {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(businessData),
  });
  return await handleResponse(res);
}

export async function simulateBusiness(businessData, delta) {
  const res = await fetch(`${API_BASE_URL}/api/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ business_data: businessData, delta }),
  });
  return await handleResponse(res);
}

export async function getForecast(forecastData) {
  const res = await fetch(`${API_BASE_URL}/api/forecast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(forecastData),
  });
  return await handleResponse(res);
}

export async function getSegmentation(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sector) params.append('sector', filters.sector);
  if (filters.region_type) params.append('region_type', filters.region_type);
  if (filters.size_band) params.append('size_band', filters.size_band);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/api/segmentation${queryString}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return await handleResponse(res);
}

export async function getFairness(mitigated = false) {
  const queryString = mitigated ? '?mitigated=true' : '';
  const res = await fetch(`${API_BASE_URL}/api/fairness${queryString}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  return await handleResponse(res);
}

export async function predictBatch(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/predict/batch`, {
    method: 'POST',
    body: formData,
  });
  return await handleResponse(res);
}

export { API_BASE_URL };
