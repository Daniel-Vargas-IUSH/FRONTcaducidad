// src/services/api.js (Versión Mejorada)

import axios from 'axios';

// La URL base se obtiene del .env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor para añadir el token (Request)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor para manejar errores comunes (Response - Nuevo)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), no hacemos nada
    return response;
  },
  (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido), 
    // asumimos que el token es inválido o ha expirado.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Token expirado o no válido. Cerrando sesión...");
      
      // Limpia la sesión en el navegador
      localStorage.removeItem('token');
      // Opcional: Redirigir al usuario a la página de login
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;