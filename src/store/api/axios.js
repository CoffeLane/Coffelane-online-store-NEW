import axios from 'axios';

const api = axios.create({
  baseURL: 'https://onlinestore-928b.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для запроса с access токеном
export const apiWithAuth = () => {
  const access = localStorage.getItem("access");
 
console.log("Access token:", access);

  return axios.create({
    baseURL: "https://onlinestore-928b.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: access ? `Bearer ${access}` : "",
    },
  });
};


export default api;
