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
    // Для refresh token сначала проверяем localStorage напрямую
    if (key === 'refresh') {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        return refreshToken.replace(/^"+|"+$/g, '');
      }
    }
    
    // Для access token и других ключей проверяем Redux Persist
    const persistData = localStorage.getItem('persist:auth');
    if (!persistData) {
      // Если нет persist:auth, для access token проверяем localStorage напрямую
      if (key === 'token') {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
          return accessToken.replace(/^"+|"+$/g, '');
        }
      }
      return null;
    }
    
    const authState = JSON.parse(persistData);
    // Извлекаем значение и убираем кавычки, которые добавляет Redux Persist
    let token = authState[key];
    if (!token || token === 'null' || token === 'undefined') {
      // Если не нашли в persist:auth, для access token проверяем localStorage
      if (key === 'token') {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
          return accessToken.replace(/^"+|"+$/g, '');
        }
      }
      return null;
    }
    return token.replace(/^"+|"+$/g, '');
  } catch (e) {
    // В случае ошибки, для access token проверяем localStorage напрямую
    if (key === 'token') {
      const accessToken = localStorage.getItem('access');
      if (accessToken) {
        return accessToken.replace(/^"+|"+$/g, '');
      }
    }
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
      // Пропускаем автоматическое обновление токена, если установлен флаг _skipAuthRefresh
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

        // Оповещаем App.jsx об обновлении через событие
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
        // Не делаем редирект здесь, пусть Slice решает, что делать с ошибкой
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

