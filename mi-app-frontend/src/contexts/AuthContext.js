// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Importar useCallback
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

    // 💡 MEJORA: Envolver logout en useCallback para estabilidad
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); 
        setUser(null);
        navigate('/login');
    }, [navigate]); // navigate es una dependencia estable proporcionada por useNavigate

  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            setUser(userData); 
        } catch (e) {
            console.error("Error al parsear datos de usuario, forzando cierre de sesión:", e);
            // La función logout ahora está definida vía useCallback
            logout(); 
        }
      }
      setLoading(false);
    };
    
    // Asegurarse de que logout sea una dependencia del useEffect si se usa dentro.
    checkUser();
  }, [logout]); // 💡 DEPENDENCIA: Asegurar que useEffect sepa de logout

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);