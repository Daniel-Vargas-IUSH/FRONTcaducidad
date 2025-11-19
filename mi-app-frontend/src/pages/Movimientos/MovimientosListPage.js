import React, { useEffect, useState } from 'react';
import * as movimientoService from '../../services/movimientoService';
// Se elimina la importación de productoService ya que no es necesaria
// import * as productoService from '../../services/productoService'; 
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; // Reutiliza el CSS de lista

const MovimientosListPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  // Se elimina el estado de productosMap
  // const [productosMap, setProductosMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
        // 1. Se elimina toda la lógica de carga de productos y creación del mapa

        // 2. Cargar movimientos (que ahora ya incluyen nombre_producto y nombre_usuario)
        const movimientosData = await movimientoService.getMovimientos();
        setMovimientos(movimientosData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos de movimientos.');
    } finally {
      setLoading(false);
    }
  };

  // Se elimina la función auxiliar getProductName

  if (loading) return <div className="loading-spinner">Cargando movimientos...</div>;
  if (error) return <div className="error-message-full">Error: {error}</div>;

  return (
    <div className="list-container">
      <h2>Historial de Movimientos</h2>
      <Link to="/movimientos/new">
        <Button variant="primary">Registrar Nuevo Movimiento</Button>
      </Link>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        <ul className="list-items">
          {movimientos.map((movimiento) => (
            <li key={movimiento.id_movimiento || movimiento.id} className="list-item-card">
              <h3>Tipo: {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}</h3>
              
                {/* AHORA USA EL NOMBRE QUE VIENE DIRECTO DEL BACKEND */}
              <p className="product-name-display">
              <p></p>Producto: <strong>{movimiento.nombre_producto}</strong></p>         
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
    </div>
  );
};

export default MovimientosListPage;