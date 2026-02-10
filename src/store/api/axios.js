import axios from 'axios';
export const BASE_URL = "https://onlinestore-928b.onrender.com";
const API_URL = `${BASE_URL}/api`;

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
  // Для админских запросов НЕ добавляем currency, чтобы избежать ошибок на бэкенде
  const isAdminRequest = config.params?._admin === 'true';
  
  if (isAdminRequest) {
    // Удаляем служебный параметр _admin, НЕ добавляем currency для админских запросов
    const { _admin, ...restParams } = config.params || {};
    config.params = restParams;
  } else {
    // Для обычных запросов добавляем currency из localStorage
    config.params = { 
      ...(config.params || {}), 
      currency: localStorage.getItem('currency') || 'USD' 
    };
  }
  return config;
});

// Интерцептор ответа для автоматического повтора без currency при 500 ошибке
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 500 или Network Error (который часто скрывает 500 из-за CORS)
    // и в запросе был параметр currency
    if ((!error.response || error.response?.status === 500) && originalRequest.params?.currency) {
      // Проверяем, не был ли это уже повторный запрос
      if (originalRequest._retryWithoutCurrency) {
        return Promise.reject(error);
      }
      
      // Создаем копию параметров БЕЗ currency
      const { currency, ...paramsWithoutCurrency } = originalRequest.params;
      originalRequest.params = paramsWithoutCurrency;
      originalRequest._retryWithoutCurrency = true;
      
      // Повторяем запрос
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

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
  
  // Для админских запросов НЕ добавляем currency, чтобы избежать ошибок на бэкенде
  const isAdminRequest = config.params?._admin === 'true';
  
  if (isAdminRequest) {
    // Удаляем служебный параметр _admin, НЕ добавляем currency для админских запросов
    const { _admin, ...restParams } = config.params || {};
    config.params = restParams;
  } else if (config.method?.toLowerCase() !== 'delete') {
    // Для обычных запросов (не DELETE) добавляем currency из localStorage
    config.params = { 
      ...(config.params || {}), 
      currency: localStorage.getItem('currency') || 'USD' 
    };
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

