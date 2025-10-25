// src/pages/Movimientos/MovimientosListPage.js
import React, { useEffect, useState } from 'react';
import * as movimientoService from '../../services/movimientoService';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; // Reutiliza el CSS de lista

const MovimientosListPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    try {
      const data = await movimientoService.getMovimientos();
      setMovimientos(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      try {
        await movimientoService.deleteMovimiento(id);
        fetchMovimientos(); // Refresca la lista
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar movimiento');
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando movimientos...</div>;
  if (error) return <div className="error-message-full">Error: {error}</div>;

  return (
    <div className="list-container">
      <h2>Lista de Movimientos</h2>
      <Link to="/movimientos/new">
        <Button variant="primary">Registrar Nuevo Movimiento</Button>
      </Link>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        <ul className="list-items">
          {movimientos.map((movimiento) => (
            // 🚨 CORRECCIÓN 1: Usar id_movimiento si ese es el nombre del ID en la DB
            <li key={movimiento.id_movimiento || movimiento.id} className="list-item-card">
              <h3>Tipo: {movimiento.tipo}</h3>
              <p>Cantidad: {movimiento.cantidad}</p>
              {/* 🚨 CORRECCIÓN 2: Usar los nombres de campo de la DB */}
              <p>Producto ID: {movimiento.id_producto}</p> 
              <p>Usuario ID: {movimiento.id_usuario}</p> 
              <p>Fecha: {new Date(movimiento.fecha_movimiento || movimiento.fecha).toLocaleDateString()}</p>
              <div className="item-actions">
                {/* 🚨 CORRECCIÓN 3: Usar el ID correcto para Editar y Eliminar */}
                <Link to={`/movimientos/edit/${movimiento.id_movimiento || movimiento.id}`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(movimiento.id_movimiento || movimiento.id)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovimientosListPage;