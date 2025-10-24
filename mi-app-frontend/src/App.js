// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductosListPage from './pages/Productos/ProductosListPage';
import MovimientosListPage from './pages/Movimientos/MovimientosListPage';
// Importa tus componentes para crear/editar productos y movimientos
// import ProductoFormPage from './pages/Productos/ProductoFormPage';
// import MovimientoFormPage from './pages/Movimientos/MovimientoFormPage';
import NotFoundPage from './pages/NotFoundPage'; // Crea esta página
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css'; // Estilos globales

// Componente para proteger rutas que requieren autenticación
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
              {/* Ejemplo de ruta para crear/editar producto */}
              {/* <Route
                path="/productos/new"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/productos/edit/:id"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              /> */}

              <Route
                path="/movimientos"
                element={
                  <PrivateRoute>
                    <MovimientosListPage />
                  </PrivateRoute>
                }
              />
               {/* Ejemplo de ruta para crear/editar movimiento */}
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
          {/* Puedes añadir un Footer aquí si lo deseas */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;