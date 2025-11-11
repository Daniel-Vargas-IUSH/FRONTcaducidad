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
      // CLAVE: Recuperamos el objeto de usuario completo si está guardado
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
            // Parseamos el objeto de usuario JSON
            const userData = JSON.parse(storedUser);
            setUser(userData); 
        } catch (e) {
            // Manejo de errores si el JSON está corrupto
            console.error("Error al parsear datos de usuario:", e);
            logout(); // Forzar el cierre de sesión si hay datos corruptos
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      
      // CLAVE: Almacenamos el objeto de usuario como un string JSON
      localStorage.setItem('user', JSON.stringify(data.user)); 
      
      setUser(data.user); 
      navigate('/');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      navigate('/login');
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // CLAVE: Eliminamos el objeto de usuario de localStorage
    localStorage.removeItem('user'); 
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