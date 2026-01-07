import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

apiWithAuth.interceptors.request.use((config) => {
  const token = getCleanToken('access'); 
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
        if (!refreshToken) {
          isRefreshing = false;
          processQueue(new Error("No refresh token"), null);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          return Promise.reject(new Error("No refresh token"));
        }

        const response = await api.post('/auth/refresh', { refresh: refreshToken });
        const { access, refresh } = response.data;

        try {
          const oldRefreshToken = getCleanToken('refresh');
          if (oldRefreshToken) {
            const oldDecoded = jwtDecode(oldRefreshToken);
            const oldExpirationTime = oldDecoded.exp * 1000;
            const timeUntilExpiration = oldExpirationTime - Date.now();
            const daysLeft = Math.floor(timeUntilExpiration / (1000 * 60 * 60 * 24));
            console.log(`🔄 Старый refresh token истекает через ${daysLeft} дней (${new Date(oldExpirationTime).toLocaleString()})`);
          }
        } catch (e) {
          // Ignoring decoding errors
        }

        if (access) {
          const cleanAccess = access.replace(/^"+|"+$/g, '');
          localStorage.setItem("access", cleanAccess);
        }
        if (refresh) {
          const cleanRefresh = refresh.replace(/^"+|"+$/g, '');
          localStorage.setItem("refresh", cleanRefresh);
          
          try {
            const newDecoded = jwtDecode(cleanRefresh);
            const newExpirationTime = newDecoded.exp * 1000;
            const timeUntilExpiration = newExpirationTime - Date.now();
            const daysLeft = Math.floor(timeUntilExpiration / (1000 * 60 * 60 * 24));
            const hoursLeft = Math.floor((timeUntilExpiration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            console.log(`✅ Новый refresh token получен! Истекает через ${daysLeft} дней, ${hoursLeft} часов (${new Date(newExpirationTime).toLocaleString()})`);
            
            // Предупреждение, если refresh token истекает через 3 дня или меньше
            // if (daysLeft <= 3 && daysLeft > 0) {
            //   console.warn(`⚠️ ВНИМАНИЕ: Refresh token истекает через ${daysLeft} дней! Рекомендуется перелогиниться.`);
            // } else if (daysLeft <= 0) {
            //   console.error(`❌ Refresh token уже истек!`);
            // }
          } catch (e) {
            console.warn("Failed to decode new refresh token:", e);
          }
        } else {
          console.warn("⚠️ ВНИМАНИЕ: Бэкенд не вернул новый refresh token! Используется старый.");
          console.warn("⚠️ Это может привести к истечению refresh token через некоторое время.");
          
          // Проверяем срок действия текущего refresh token
          try {
            const currentRefreshToken = getCleanToken('refresh');
            if (currentRefreshToken) {
              const decoded = jwtDecode(currentRefreshToken);
              const expirationTime = decoded.exp * 1000;
              const timeUntilExpiration = expirationTime - Date.now();
              const daysLeft = Math.floor(timeUntilExpiration / (1000 * 60 * 60 * 24));
              console.warn(`⚠️ Текущий refresh token истекает через ${daysLeft} дней (${new Date(expirationTime).toLocaleString()})`);
            }
          } catch (e) {
            //Ignoring errors
          }
        }
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { access, refresh }
        }));

        const cleanAccess = access?.replace(/^"+|"+$/g, '') || access;
        processQueue(null, cleanAccess);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${cleanAccess}`;
        return apiWithAuth.request(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        if (err.response?.status === 401 || err.response?.status === 403) {
          const errorDetail = err.response?.data?.detail || err.response?.data?.message || '';
          if (errorDetail.includes('Token is expired') || 
              errorDetail.includes('token_not_valid') || 
              errorDetail.includes('Invalid token') ||
              err.response?.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.dispatchEvent(new CustomEvent('tokenExpired'));
          }
        } else if (err.message === "No refresh token") {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.dispatchEvent(new CustomEvent('tokenExpired'));
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

