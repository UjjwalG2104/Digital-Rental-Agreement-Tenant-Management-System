import axios from "axios";

// Create a consistent API instance
export const createApiInstance = (token = null) => {
  const instance = axios.create({
    baseURL: window.location.origin,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  // Add request interceptor for debugging
  instance.interceptors.request.use(
    (config) => {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  instance.interceptors.response.use(
    (response) => {
      console.log('API Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error('API Response Error:', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create instances for different use cases
export const publicApi = createApiInstance();
export const authApi = createApiInstance();

// Function to create authenticated API instance
export const createAuthenticatedApi = (token) => createApiInstance(token);
