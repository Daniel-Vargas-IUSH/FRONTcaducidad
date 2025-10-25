// src/App.js (CORREGIDO)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductosListPage from './pages/Productos/ProductosListPage';
import MovimientosListPage from './pages/Movimientos/MovimientosListPage';
// 1. IMPORTA EL COMPONENTE DE FORMULARIO DE PRODUCTO
import ProductoFormPage from './pages/Productos/ProductoFormPage'; 
// import MovimientoFormPage from './pages/Movimientos/MovimientoFormPage';
import NotFoundPage from './pages/NotFoundPage'; // Crea esta página
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css'; // Estilos globales

// Componente para proteger rutas que requieren autenticación (dejado igual)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rutas protegidas */}
              <Route
                path="/productos"
                element={
                  <PrivateRoute>
                    <ProductosListPage />
                  </PrivateRoute>
                }
              />
              
              {/* 🏆 RUTA DE CREACIÓN: DESCOMENTADA Y LISTA */}
              <Route
                path="/productos/new"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              />
              
              {/* 🏆 RUTA DE EDICIÓN: DESCOMENTADA Y CORREGIDA con ':id_producto' */}
              <Route
                path="/productos/edit/:id_producto"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/movimientos"
                element={
                  <PrivateRoute>
                    <MovimientosListPage />
                  </PrivateRoute>
                }
              />
               {/* Rutas de movimientos (dejadas comentadas, asumiendo que las harás después) */}
              {/* <Route
                path="/movimientos/new"
                element={
                  <PrivateRoute>
                    <MovimientoFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/movimientos/edit/:id"
                element={
                  <PrivateRoute>
                    <MovimientoFormPage />
                  </PrivateRoute>
                }
              /> */}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;