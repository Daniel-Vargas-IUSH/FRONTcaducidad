import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
// 🔑 CAMBIO 1: Renombramos HomePage por DashboardPage (o importamos el nuevo)
import DashboardPage from './pages/DashboardPage'; // Asegúrate de que este es el nuevo componente
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductosListPage from './pages/Productos/ProductosListPage';
import MovimientosListPage from './pages/Movimientos/MovimientosListPage';
import ProductoFormPage from './pages/Productos/ProductoFormPage'; 
import MovimientoFormPage from './pages/Movimientos/MovimientosFormPage'; 
import NotFoundPage from './pages/NotFoundPage'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css'; 

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; 
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
              
              {/* 🔑 CAMBIO 2: PROTEGER EL DASHBOARD (RUTA RAÍZ) */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } 
              />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rutas protegidas - Productos */}
              <Route
                path="/productos"
                element={
                  <PrivateRoute>
                    <ProductosListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/productos/new"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/productos/edit/:id_producto"
                element={
                  <PrivateRoute>
                    <ProductoFormPage />
                  </PrivateRoute>
                }
              />

              {/* Rutas protegidas - Movimientos */}
              <Route
                path="/movimientos"
                element={
                  <PrivateRoute>
                    <MovimientosListPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/movimientos/new"
                element={
                  <PrivateRoute>
                    <MovimientoFormPage />
                  </PrivateRoute>
                }
              />
              {/* Nota: Dejaré la ruta de edición de movimientos, aunque suelen ser inmutables. */}
              <Route
                path="/movimientos/edit/:id"
                element={
                  <PrivateRoute>
                    <MovimientoFormPage />
                  </PrivateRoute>
                }
              /> 

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;