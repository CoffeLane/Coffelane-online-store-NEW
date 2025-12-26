import axios from 'axios';

const API_URL = 'https://onlinestore-928b.onrender.com/api';

// Базовый экземпляр
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Экземпляр с авторизацией
export const apiWithAuth = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getCleanToken = (key) => {
  try {
    const persistData = localStorage.getItem('persist:auth');
    if (!persistData) return null;
    const authState = JSON.parse(persistData);
    // Извлекаем значение и убираем кавычки, которые добавляет Redux Persist
    let token = authState[key];
    if (!token || token === 'null' || token === 'undefined') return null;
    return token.replace(/^"+|"+$/g, '');
  } catch (e) {
    return null;
  }
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

// Интерцептор запроса
apiWithAuth.interceptors.request.use((config) => {
  const token = getCleanToken('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор ответа
apiWithAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ПРОВЕРКА: Если ошибка не связана с запросом или нет URL, просто отклоняем
    if (!originalRequest || !originalRequest.url) {
      return Promise.reject(error);
    }

    // Если 401 на самом запросе обновления токена — выходим
    if (originalRequest.url.includes('/auth/refresh')) {
      isRefreshing = false;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiWithAuth(originalRequest);
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

        // Оповещаем App.jsx об обновлении через событие
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
          detail: { access, refresh } 
        }));

        processQueue(null, access);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiWithAuth(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        // Не делаем редирект здесь, пусть Slice решает, что делать с ошибкой
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

