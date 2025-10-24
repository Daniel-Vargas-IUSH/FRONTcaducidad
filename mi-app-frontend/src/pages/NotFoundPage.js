// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css'; // Crea este CSS

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className="home-link">Volver a la página principal</Link>
    </div>
  );
};

export default NotFoundPage;