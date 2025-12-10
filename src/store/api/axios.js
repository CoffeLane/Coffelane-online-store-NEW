import axios from 'axios';

const api = axios.create({
  baseURL: 'https://onlinestore-928b.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});


export const apiWithAuth = (tokenFromState = null) => {

  const tokenFromStorage = localStorage.getItem("access");
  const access = tokenFromState || tokenFromStorage;

  return axios.create({
    baseURL: "https://onlinestore-928b.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: access ? `Bearer ${access}` : "",
    },
  });
};

export default api;
