import axios from 'axios';

// обычный API без авторизации
const api = axios.create({
  baseURL: 'https://onlinestore-928b.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Глобальные переменные для управления обновлением токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const apiWithAuth = (tokenFromState = null) => {
  const tokenFromStorage = localStorage.getItem("access");
  const rawToken = tokenFromState || tokenFromStorage;

  if (!rawToken) {
    throw new Error("No access token. User is not authenticated.");
  }

  const access = rawToken.replace(/^"|"$/g, ""); // убираем двойные кавычки

  const instance = axios.create({
    baseURL: "https://onlinestore-928b.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
  });

  // Добавляем interceptor для автоматического обновления токена
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Если ошибка 401 и это не запрос на обновление токена и не повторный запрос
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
          // Если токен уже обновляется, добавляем запрос в очередь
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refresh");
          if (!refreshToken) {
            // Если нет refresh token, просто возвращаем оригинальную ошибку
            // Не разлогиниваем пользователя
            isRefreshing = false;
            return Promise.reject(error);
          }

          // Обновляем токен напрямую через API, без Redux (чтобы избежать циклической зависимости)
          const refreshResponse = await api.post("/auth/refresh", {
            refresh: refreshToken.replace(/^"|"$/g, ""),
          });

          const { access, refresh: newRefresh } = refreshResponse.data;

          if (access) {
            // Сохраняем новый токен в localStorage
            localStorage.setItem("access", access);
            if (newRefresh) {
              localStorage.setItem("refresh", newRefresh);
            }

            // Отправляем событие для обновления Redux state (без циклической зависимости)
            window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { access, refresh: newRefresh } }));

            // Обновляем заголовок для оригинального запроса
            originalRequest.headers.Authorization = `Bearer ${access}`;
            
            // Обновляем токен для всех ожидающих запросов
            processQueue(null, access);
            isRefreshing = false;
            
            // Повторяем оригинальный запрос
            return instance(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
        } catch (refreshError) {
          // Если refresh token истек, не разлогиниваем пользователя
          // Просто возвращаем оригинальную ошибку 401, которую можно обработать в компоненте
          console.warn("⚠️ Failed to refresh token:", refreshError.response?.status, refreshError.response?.data || refreshError.message);
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Возвращаем оригинальную ошибку 401, а не ошибку refresh token
          // Это позволит компонентам обработать ошибку как обычную 401
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};


export default api;

