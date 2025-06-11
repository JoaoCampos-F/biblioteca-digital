import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
});

http.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");

    // Evita enviar token no login
    if (token && config.url !== "/api/auth/login") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
