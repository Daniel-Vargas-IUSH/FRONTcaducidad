// src/pages/HomePage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css'; // Crea un archivo CSS para estilos de home

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Bienvenido a K-DUCANDO</h1>
        {user ? (
          <p>¡Hola, {user.nombre || 'usuario'}! Explora tus productos y movimientos.</p>
        ) : (
          <p>Por favor, inicia sesión o regístrate para acceder a todas las funcionalidades.</p>
        )}
        <div className="home-actions">
          {user && (
            <>
              <a href="/productos" className="home-action-btn">Ver Productos</a>
              <a href="/movimientos" className="home-action-btn">Ver Movimientos</a>
            </>
          )}
          {!user && (
            <>
              <a href="/login" className="home-action-btn primary">Iniciar Sesión</a>
              <a href="/register" className="home-action-btn secondary">Registrarse</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

