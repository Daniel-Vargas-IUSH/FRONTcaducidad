// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Aquí podrías validar el token con el backend si es necesario
        // Por ahora, asumimos que si hay token, el usuario está logueado
        // Idealmente, harías una petición a /auth/me o similar
        setUser({ token: storedToken }); // O mejor, decodificar el token o pedir info del usuario
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user); // Asume que la API devuelve el objeto de usuario
      navigate('/'); // Redirige a la página principal
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      // Opcionalmente, loguear al usuario automáticamente después del registro
      // localStorage.setItem('token', data.token);
      // setUser(data.user);
      navigate('/login');
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);