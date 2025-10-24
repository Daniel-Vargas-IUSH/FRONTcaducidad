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
            <li key={movimiento._id} className="list-item-card">
              <h3>Tipo: {movimiento.tipo}</h3>
              <p>Cantidad: {movimiento.cantidad}</p>
              <p>Producto ID: {movimiento.producto}</p>
              <p>Usuario ID: {movimiento.usuario}</p>
              <p>Fecha: {new Date(movimiento.fecha).toLocaleDateString()}</p>
              <div className="item-actions">
                <Link to={`/movimientos/edit/${movimiento._id}`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(movimiento._id)}>
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