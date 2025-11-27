import React, { useEffect, useState } from 'react';
import * as movimientoService from '../../services/movimientoService';
// ❌ ELIMINAMOS la importación de 'Link' ya que usaremos un Modal
// import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; // Asumimos que aquí están las clases de centrado
import { useAuth } from '../../contexts/AuthContext';

// 🔑 IMPORTACIONES DEL MODAL Y EL FORMULARIO
import Modal from '../../components/common/Modal'; 
import MovimientoForm from './MovimientoForm'; 

const MovimientosListPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🔑 Estado para controlar la visibilidad del Modal
  const [isModalOpen, setIsModalOpen] = useState(false); 

    // OBTENER EL ESTADO DE AUTENTICACIÓN Y EL ROL
    const { user } = useAuth();
    
    // LÓGICA DE ADMIN
    const userRole = user && user.rol ? user.rol.trim().toLowerCase() : '';
    const isAdmin = userRole === 'admin';
    
  useEffect(() => {
    fetchAllData();
  }, []);

  // Función para cargar/refrescar los movimientos
  const fetchAllData = async () => {
    setError(null);
    setLoading(true);
    try {
        // Cargar movimientos
        const movimientosData = await movimientoService.getMovimientos();
        setMovimientos(movimientosData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos de movimientos.');
    } finally {
      setLoading(false);
    }
  };
  
  // 🔑 Función llamada por el MovimientoForm al guardar exitosamente
  const handleMovementSuccess = () => {
    fetchAllData(); // Recarga la lista
    setIsModalOpen(false); // Cierra el modal
  };

  // Función auxiliar para las clases CSS (para diferenciar visualmente los tipos)
  const getItemClassName = (tipo) => {
    return `list-item-card list-item-${tipo.toLowerCase()}`;
  };


  if (loading) return <div className="loading-spinner">Cargando movimientos...</div>;
  if (error) return <div className="error-message-full">Error: {error}</div>;

  return (
    // Se ha compactado el código en esta área sensible para eliminar espacios fantasma
    <div className="list-container">
        <h2>Historial de Movimientos</h2>
        {isAdmin && (
            <div className="list-actions-header">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Registrar Nuevo Movimiento
                </Button>
            </div>
        )}
        {movimientos.length === 0 ? (
            <p>No hay movimientos registrados.</p>
        ) : (
            <ul className="list-items">
                {movimientos.map((movimiento) => (
                    <li 
                        key={movimiento.id_movimiento || movimiento.id} 
                        className={getItemClassName(movimiento.tipo)}
                    >
                        <h3>Tipo: {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}</h3>
                        
                        <p className="product-name-display">Producto: <strong>{movimiento.nombre_producto}</strong></p>
                        <p><small>ID Producto: {movimiento.id_producto}</small></p>
                        <p>Cantidad: {movimiento.cantidad}</p> 
                        
                        {/* MOSTRAR EL NOMBRE DEL USUARIO */}
                        <p>Usuario: <strong>{movimiento.nombre_usuario}</strong></p>
                        
                        <p>Usuario ID: {movimiento.id_usuario}</p> 
                        <p>Fecha: {new Date(movimiento.fecha_movimiento || movimiento.fecha).toLocaleDateString()}</p>
                    </li>
                ))}
            </ul>
        )}

        {/* 🔑 COMPONENTE MODAL: Renderiza el formulario */}
        {isAdmin && (
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Registrar Movimiento de Stock"
            >
                <MovimientoForm 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={handleMovementSuccess} 
                />
            </Modal>
        )}
    </div>
);
};

export default MovimientosListPage;