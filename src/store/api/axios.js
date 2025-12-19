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

  const access = rawToken.replace(/^"|"$/g, ""); 

  const instance = axios.create({
    baseURL: "https://onlinestore-928b.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
  });


  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
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
            isRefreshing = false;
            return Promise.reject(error);
          }
          const refreshResponse = await api.post("/auth/refresh", {
            refresh: refreshToken.replace(/^"|"$/g, ""),
          });

          const { access, refresh: newRefresh } = refreshResponse.data;

          if (access) {
            localStorage.setItem("access", access);
            if (newRefresh) {
              localStorage.setItem("refresh", newRefresh);
            }
            window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: { access, refresh: newRefresh } }));
            originalRequest.headers.Authorization = `Bearer ${access}`;
            processQueue(null, access);
            isRefreshing = false;
          
            return instance(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
        } catch (refreshError) {
          console.warn("Failed to refresh token:", refreshError.response?.status, refreshError.response?.data || refreshError.message);
          processQueue(refreshError, null);
          isRefreshing = false;
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};


export default api;

