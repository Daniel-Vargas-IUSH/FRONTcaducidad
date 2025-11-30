// src/components/layout/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import NotificationBell from '../common/NotificationBell';
import './Header.css'; 

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        {/* === Logo siempre apunta a la raíz === */}
        <Link to="/" className="logo-link">
          {/* 1. CÓDIGO SVG PEGADO DIRECTAMENTE EN JSX */}
          <svg className="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" 
                      d="M 12 10 H 30 V 90 H 12 V 10 Z" 
                      fill="#00C4CC"/>
              <path d="M 38 48 L 75 10 H 90 L 53 48 L 90 86 V 90 H 75 L 38 52 V 48 Z" 
                      fill="#00C4CC"/>
              <path d="M 60 70 L 70 80 L 80 70 L 70 60 L 60 70 Z" 
                      fill="#00C4CC"/>
          </svg>
          
          {/* 2. TEXTO K-DUCANDO EN UN SPAN PARA ESTILIZAR */}
          <span className="logo-text">DUCANDO</span>
        </Link>
        

        <nav className="nav">
          {user ? (
            <>            
              {/* 🔑 NUEVO: Enlace explícito al Dashboard (Ruta raíz) */}
              <Link to="/">Principal</Link>
              
              <Link to="/productos">Productos</Link>
              <Link to="/movimientos">Movimientos</Link>
              
              <Button onClick={logout} variant="secondary">Cerrar Sesión</Button>
              <NotificationBell />
            </>
          ) : (
            <>
              <Link to="/login">Iniciar Sesión</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;