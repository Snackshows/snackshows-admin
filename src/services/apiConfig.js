// API Configuration with Retry Logic and Error Handling
// const BASE_URL = 'https://king-prawn-app-ewizm.ondigitalocean.app/api/v1';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = "http://localhost:8000/api/v1";

// Token management
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API call with retry logic
const apiCall = async (endpoint, method = 'GET', data = null, customHeaders = {}, retryCount = 0) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    if (response.status === 404) {
      throw new Error('The requested resource was not found.');
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    return result;

  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);

    if (retryCount < MAX_RETRIES && 
        (error.message.includes('fetch') || 
         error.message.includes('network') ||
         error.message.includes('timeout'))) {
      
      console.log(`Retrying... Attempt ${retryCount + 1}/${MAX_RETRIES}`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return apiCall(endpoint, method, data, customHeaders, retryCount + 1);
    }

    throw error;
  }
};

// Form data upload
const apiCallFormData = async (endpoint, method = 'POST', formData, retryCount = 0) => {
  const token = getAuthToken();
  
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    body: formData
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return result;

  } catch (error) {
    console.error(`Upload Error (${method} ${endpoint}):`, error);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying upload... Attempt ${retryCount + 1}/${MAX_RETRIES}`);
      await sleep(RETRY_DELAY * (retryCount + 1));
      return apiCallFormData(endpoint, method, formData, retryCount + 1);
    }

    throw error;
  }
};

export { 
  apiCall, 
  apiCallFormData, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken,
  BASE_URL 
};
