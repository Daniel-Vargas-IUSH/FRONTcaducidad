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