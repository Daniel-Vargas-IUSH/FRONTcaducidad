// src/services/productoService.js

import api from './api';

export const getProductos = async () => {
  const response = await api.get('/productos');
  return response.data;
};

export const getProductoById = async (id) => {
  const response = await api.get(`/productos/${id}`);
  return response.data;
};

export const createProducto = async (productoData) => {
  const response = await api.post('/productos', productoData);
  return response.data;
};

export const updateProducto = async (id, productoData) => {
  const response = await api.put(`/productos/${id}`, productoData);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

// 🔑 NUEVA FUNCIÓN AÑADIDA: Obtener Alertas de Caducidad
export const getAlerts = async () => {
    try {
        // Llama a la ruta protegida: GET /api/productos/alertas
        const response = await api.get('/productos/alertas');
        return response.data;
    } catch (error) {
        console.error("Error al obtener alertas:", error);
        throw error;
    }
};