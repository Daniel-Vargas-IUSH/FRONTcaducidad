// src/pages/Productos/ProductosListPage.js (CÓDIGO FINAL CON FORMATO DE FECHAS)

import React, { useEffect, useState } from 'react';
import * as productoService from '../../services/productoService';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; 

// --- FUNCIÓN DE UTILIDAD: FORMATEO DE FECHAS ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Asume el formato YYYY-MM-DD (de MySQL)
    try {
        const date = new Date(dateString);
        // Usar toLocaleDateString() para un formato local amigable (e.g., DD/MM/YYYY)
        // Puedes cambiar 'es-ES' y las opciones si necesitas otro formato específico.
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch (e) {
        return dateString; // Devuelve el string original si hay un error
    }
};

// Función auxiliar para renderizar la alerta con estilos (usa el estado calculado por el controlador)
const getAlertClass = (estado) => {
    switch (estado) {
        case 'Roja':
            return 'alert-roja';
        case 'Amarilla':
            return 'alert-amarilla';
        case 'Verde':
            return 'alert-verde';
        case 'Expirado':
            return 'alert-expirado'; 
        default:
            return 'alert-sin-fecha';
    }
};

const ProductosListPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await productoService.getProductos(); 
            
            // Lógica robusta para evitar el error 'map is not a function'
            const finalData = Array.isArray(responseData) ? responseData : responseData.data || [];
            
            if (!Array.isArray(finalData)) {
                throw new Error("La API no devolvió un listado válido de productos.");
            }
            setProductos(finalData);

        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError(err.message || err.response?.data?.error || 'Error al cargar productos');
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
                setError(err.response?.data?.error || 'Error al eliminar producto');
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
                        <li key={producto.id_producto} className="list-item-card">
                            <div className="item-header">
                                <h3>{producto.nombre}</h3>
                                {/* Muestra el estado de alerta con la clase de color */}
                                <span className={`alerta-tag ${getAlertClass(producto.estado_alerta)}`}>
                                    {producto.estado_alerta}
                                </span>
                            </div>

                            {/* Campos sincronizados con la DB y formateados */}
                            <p>Ubicación: {producto.ubicacion}</p>
                            <p>Stock/Cantidad: {producto.cantidad}</p> 
                            
                            {/* 🏆 APLICACIÓN DEL FORMATO DE FECHA */}
                            <p>Fecha de Ingreso: {formatDate(producto.fecha_ingreso)}</p>
                            <p>Fecha de Caducidad: {formatDate(producto.fecha_caducidad)}</p>
                            
                            <div className="item-actions">
                                <Link to={`/productos/edit/${producto.id_producto}`}>
                                    <Button variant="secondary">Editar</Button>
                                </Link>
                                <Button variant="danger" onClick={() => handleDelete(producto.id_producto)}>
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