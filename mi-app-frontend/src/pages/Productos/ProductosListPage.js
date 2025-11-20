import React, { useEffect, useState } from 'react';
import * as productoService from '../../services/productoService';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; 

// Importar el hook useAuth desde la ruta correcta
import { useAuth } from '../../contexts/AuthContext'; 

// --- FUNCIÓN DE UTILIDAD: FORMATEO DE FECHAS ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch (e) {
        return dateString;
    }
};

// Función auxiliar para renderizar la alerta con estilos
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

// -------------------------------------------------------------------

const ProductosListPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔑 OBTENER EL ESTADO DE AUTENTICACIÓN Y EL ROL
    const { user } = useAuth(); 
    
    // 💡 CORRECCIÓN IMPLEMENTADA: Convertir a minúsculas para comparar ('Admin' vs 'admin')
    const userRole = user && user.rol ? user.rol.toLowerCase() : '';
    const isAdmin = userRole === 'admin'; 
    
    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Nota: Asume que productoService.getProductos() incluye el JWT en el header.
            const responseData = await productoService.getProductos(); 
            
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
        // Bloqueo visual preventivo (el backend es la seguridad real)
        if (!isAdmin) {
             alert("No tienes permiso para eliminar productos.");
             return;
        }

        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await productoService.deleteProducto(id);
                fetchProductos(); // Refresca la lista
            } catch (err) {
                // Si el backend devuelve 403 Forbidden, este error se muestra.
                setError(err.response?.data?.error || 'Error al eliminar producto');
            }
        }
    };

    if (loading) return <div className="loading-spinner">Cargando productos...</div>;
    if (error) return <div className="error-message-full">Error: {error}</div>;

    return (
        <div className="list-container">
            <h2>Lista de Productos</h2>
            
            {/* 🔑 SOLO MOSTRAR EL BOTÓN 'CREAR' SI ES ADMIN */}
            {isAdmin && (
                <Link to="/productos/new">
                    <Button variant="primary">Crear Nuevo Producto</Button>
                </Link>
            )}

            {productos.length === 0 ? (
                <p>No hay productos registrados.</p>
            ) : (
                <ul className="list-items">
                    {productos.map((producto) => (
                        <li key={producto.id_producto} className="list-item-card">
                            <div className="item-header">
                                <h3>{producto.nombre}</h3>
                                <span className={`alerta-tag ${getAlertClass(producto.estado_alerta)}`}>
                                    {producto.estado_alerta}
                                </span>
                            </div>

                            <p>Ubicación: {producto.ubicacion}</p>
                            <p>Stock/Cantidad: {producto.cantidad}</p> 
                            <p>
                                Creado por: <span style={{ fontWeight: 'bold' }}>{producto.nombre_creador || 'N/A'}</span>
                            </p>
                            <p>Fecha de Ingreso: {formatDate(producto.fecha_ingreso)}</p>
                            <p>Fecha de Caducidad: {formatDate(producto.fecha_caducidad)}</p>
                            
                            {/* 🔑 SOLO MOSTRAR BOTONES DE ACCIÓN SI ES ADMIN */}
                            {isAdmin && (
                                <div className="item-actions">
                                    <Link to={`/productos/edit/${producto.id_producto}`}>
                                        <Button variant="secondary">Editar</Button>
                                    </Link>
                                    <Button variant="danger" onClick={() => handleDelete(producto.id_producto)}>
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProductosListPage;