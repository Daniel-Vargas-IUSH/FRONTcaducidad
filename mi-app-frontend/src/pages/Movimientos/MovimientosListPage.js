import React, { useEffect, useState } from 'react';
import * as movimientoService from '../../services/movimientoService';
import * as productoService from '../../services/productoService';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; // Reutiliza el CSS de lista

const MovimientosListPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productosMap, setProductosMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
        // 1. Cargar productos y crear el mapa {id_producto: nombre}
        const productosData = await productoService.getProductos();
        const map = productosData.reduce((acc, producto) => {
            acc[producto.id_producto] = producto.nombre;
            return acc;
        }, {});
        setProductosMap(map);

        // 2. Cargar movimientos
        const movimientosData = await movimientoService.getMovimientos();
        setMovimientos(movimientosData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos (movimientos o productos)');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener el nombre del producto
  const getProductName = (id_producto) => {
    return productosMap[id_producto] || `ID: ${id_producto} (Desconocido)`;
  };

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
              
                {/* MOSTRAR EL NOMBRE DEL PRODUCTO */}
              <p className="product-name-display">
                    Producto: <strong>{getProductName(movimiento.id_producto)}</strong>
                </p>
                {/* El ID del producto se mantiene debajo */}
                <p><small>ID Producto: {movimiento.id_producto}</small></p>

              <p>Cantidad: {movimiento.cantidad}</p> 
              <p>Usuario ID: {movimiento.id_usuario}</p> 
              <p>Fecha: {new Date(movimiento.fecha_movimiento || movimiento.fecha).toLocaleDateString()}</p>
              
              {/* Se eliminó la sección <div className="item-actions"> que contenía los botones Editar y Eliminar */}

            </li>
          ))}
        </ul>
      )}
    
      {/* Se eliminó la sección del CustomModal */}
    </div>
  );
};

export default MovimientosListPage;