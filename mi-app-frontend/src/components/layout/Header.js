// src/components/layout/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import './Header.css'; // Crea este archivo CSS

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Mi App</Link>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/productos">Productos</Link>
              <Link to="/movimientos">Movimientos</Link>
              <Button onClick={logout} variant="secondary">Cerrar Sesión</Button>
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

