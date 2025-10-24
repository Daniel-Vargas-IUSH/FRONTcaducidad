// src/pages/Productos/ProductosListPage.js
import React, { useEffect, useState } from 'react';
import * as productoService from '../../services/productoService';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; // Crea un archivo CSS para estilos de lista

const ProductosListPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await productoService.getProductos();
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productoService.deleteProducto(id);
        fetchProductos(); // Refresca la lista
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar producto');
      }
    }
  };

  if (loading) return <div className="loading-spinner">Cargando productos...</div>;
  if (error) return <div className="error-message-full">Error: {error}</div>;

  return (
    <div className="list-container">
      <h2>Lista de Productos</h2>
      <Link to="/productos/new">
        <Button variant="primary">Crear Nuevo Producto</Button>
      </Link>

      {productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <ul className="list-items">
          {productos.map((producto) => (
            <li key={producto._id} className="list-item-card">
              <h3>{producto.nombre}</h3>
              <p>Descripción: {producto.descripcion}</p>
              <p>Precio: ${producto.precio}</p>
              <p>Stock: {producto.stock}</p>
              <div className="item-actions">
                <Link to={`/productos/edit/${producto._id}`}>
                  <Button variant="secondary">Editar</Button>
                </Link>
                <Button variant="danger" onClick={() => handleDelete(producto._id)}>
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

export default ProductosListPage;