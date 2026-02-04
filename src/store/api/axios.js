import axios from 'axios';

const API_URL = 'https://onlinestore-928b.onrender.com/api';

const getCleanToken = (key) => {
  const token = localStorage.getItem(key);
  if (!token || ['null', 'undefined', '""'].includes(token)) return null;
  return token.replace(/^"+|"+$/g, '');
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use((config) => {
  config.params = { 
    ...config.params, 
    currency: localStorage.getItem('currency') || 'USD' 
  };
  return config;
});

export const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiWithAuth.interceptors.request.use((config) => {
  const token = getCleanToken('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  if (config.method?.toLowerCase() !== 'delete') {
    config.params = { ...config.params, currency: localStorage.getItem('currency') || 'USD' };
  }
  return config;
});

apiWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiWithAuth.request(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getCleanToken('refresh');
      if (!refreshToken) {
        isRefreshing = false;
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post('/auth/refresh', { refresh: refreshToken });
        const access = data.access.replace(/^"+|"+$/g, '');
        const refresh = data.refresh?.replace(/^"+|"+$/g, '');

        localStorage.setItem("access", access);
        if (refresh) localStorage.setItem("refresh", refresh);

        processQueue(null, access);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiWithAuth.request(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        logoutUser();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.dispatchEvent(new CustomEvent('tokenExpired'));
}

export default api;

