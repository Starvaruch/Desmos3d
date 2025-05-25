import axios from 'axios';

// API base URL - change this to match your backend URL in production
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Debug API requests by logging them
const logRequests = true;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log request for debugging
    if (logRequests) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: (config.baseURL || '') + (config.url || ''),
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    if (logRequests) {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Log error response for debugging
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      request: error.config ? {
        method: error.config.method?.toUpperCase(),
        url: (error.config.baseURL || '') + (error.config.url || ''),
        data: error.config.data
      } : 'No request config'
    });
    
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 