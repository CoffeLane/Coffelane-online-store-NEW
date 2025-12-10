import axios from 'axios';

// обычный API без авторизации
const api = axios.create({
  baseURL: 'https://onlinestore-928b.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// API с авторизацией
export const apiWithAuth = (tokenFromState = null) => {
  const tokenFromStorage = localStorage.getItem("access");
  const access = tokenFromState || tokenFromStorage;

  if (!access) {
    throw new Error("No access token. User is not authenticated.");
  }

  const headers = { "Content-Type": "application/json" };
  headers.Authorization = `Bearer ${access}`;

  return axios.create({
    baseURL: "https://onlinestore-928b.onrender.com/api",
    headers,
  });
};

export default api;

