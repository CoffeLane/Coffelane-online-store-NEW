import axios from 'axios';

const API_URL = 'https://onlinestore-928b.onrender.com/api';

// Базовый экземпляр для запросов без авторизации (и для самого Refresh)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Вспомогательная функция для извлечения чистых токенов из Redux Persist
const getCleanToken = (key) => {
  try {
    const persistData = localStorage.getItem('persist:auth');
    if (!persistData) return null;

    const authState = JSON.parse(persistData);
    const token = authState[key]; // Это может быть '"token_string"'

    if (!token || token === 'null') return null;

    // Убираем лишние кавычки (бывает по 2-3 слоя из-за сериализации)
    return token.replace(/^"+|"+$/g, '');
  } catch (e) {
    console.error("Ошибка парсинга токена из localStorage", e);
    return null;
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const apiWithAuth = () => {
  const access = getCleanToken('token');

  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(access && { Authorization: `Bearer ${access}` }),
    },
  });

  // ИНТЕРЦЕПТОР ОТВЕТА
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Если 401 и это не повторный запрос и не сам запрос рефреша
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
        
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refresh = getCleanToken('refresh'); // Ищем рефреш в персисте
          if (!refresh) throw new Error("No refresh token");

          // ВАЖНО: используем базовый api (без интерцепторов), путь /auth/refresh
          const response = await api.post('/auth/refresh', { refresh });
          
          const newAccess = response.data.access;
          const newRefresh = response.data.refresh;

          // Обновляем localStorage вручную, чтобы Redux Persist подхватил при перезагрузке
          // Но лучше вызвать dispatch(updateTokens) если есть доступ к store
          // Для простоты обновим через кастомное событие, которое поймает ваш AuthSlice
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { access: newAccess, refresh: newRefresh } 
          }));

          processQueue(null, newAccess);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return instance(originalRequest);

        } catch (refreshError) {
          console.error("❌ Фатальная ошибка обновления токена:", refreshError);
          isRefreshing = false;
          processQueue(refreshError, null);
          
          // Если рефреш не удался — разлогиниваем (чистим стор)
          localStorage.removeItem('persist:auth');
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default api;

