// src/services/movimientoService.js (CORREGIDO)

import api from './api';

export const getMovimientos = async () => {
  const response = await api.get('/movimientos');
  
  // 🏆 CORRECCIÓN: Devolver response.data.data
  // Tu controlador Express devuelve: { mensaje: "...", data: [...] }
  // Necesitamos acceder a la propiedad 'data' que contiene el array.
  return response.data.data; 
};

export const getMovimientoById = async (id) => {
  const response = await api.get(`/movimientos/${id}`);
  return response.data;
};

export const createMovimiento = async (movimientoData) => {
  const response = await api.post('/movimientos', movimientoData);
  return response.data;
};

export const updateMovimiento = async (id, movimientoData) => {
  const response = await api.put(`/movimientos/${id}`, movimientoData);
  return response.data;
};

export const deleteMovimiento = async (id) => {
  const response = await api.delete(`/movimientos/${id}`);
  return response.data;
};