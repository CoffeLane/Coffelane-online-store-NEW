import axios from 'axios';

const API_URL = 'https://onlinestore-928b.onrender.com/api';

// Базовий екземпляр для звичайних запитів (логін, реєстрація, рефреш)
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Екземпляр для запитів, де потрібна авторизація
export const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getCleanToken = (key) => {
  const storageKey = key === 'refresh' ? 'refresh' : 'access';
  const rawToken = localStorage.getItem(storageKey);
  if (!rawToken || rawToken === 'null' || rawToken === 'undefined' || rawToken === '""') {
    return null;
  }
  return rawToken.replace(/^"+|"+$/g, '');
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Додаємо токен до кожного запиту apiWithAuth
apiWithAuth.interceptors.request.use((config) => {
  const token = getCleanToken('access'); // виправлено ключ на 'access'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || !originalRequest.url) {
      return Promise.reject(error);
    }

    // Запобігаємо циклу на самому рефреші
    if (originalRequest.url.includes('/auth/refresh')) {
      isRefreshing = false;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest._skipAuthRefresh) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiWithAuth.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getCleanToken('refresh');
        if (!refreshToken) throw new Error("No refresh token");

        const response = await api.post('/auth/refresh', { refresh: refreshToken });
        const { access, refresh } = response.data;

        // Подія для синхронізації з Redux/App
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { access, refresh }
        }));

        processQueue(null, access);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiWithAuth.request(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);

        // Якщо рефреш не вдався (токен прострочений зовсім)
        if (err.response?.status === 401 || err.response?.status === 403) {
          // ТВОЯ ВАЖЛИВА ПЕРЕВІРКА:
          if (!originalRequest.url.includes('/auth/login')) {
            console.error("Session expired. Logging out...");
            localStorage.clear();
            window.location.href = '/recovery_password/login';
          }
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

