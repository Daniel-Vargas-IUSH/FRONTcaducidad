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

// --- FUNCIÓN DE UTILIDAD: FORMATEO DE MONEDA ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // Usamos Intl.NumberFormat para un formato de moneda local
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP', // O la moneda que uses (USD, EUR, etc.)
        minimumFractionDigits: 2,
    }).format(value);
};

// -------------------------------------------------------------------

const ProductosListPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔑 OBTENER EL ESTADO DE AUTENTICACIÓN Y EL ROL
    const { user } = useAuth(); 
    
    // Convertir a minúsculas para comparar ('Admin' vs 'admin')
    const userRole = user && user.rol ? user.rol.toLowerCase() : '';
    const isAdmin = userRole === 'admin'; 
    
    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        setError(null);
        try {
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
        if (!isAdmin) {
             alert("No tienes permiso para eliminar productos.");
             return;
        }

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
            
            {/* SOLO MOSTRAR EL BOTÓN 'CREAR' SI ES ADMIN */}
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

                            {/* ❌ Se eliminaron los ** */}
                            <p>Ubicación: {producto.ubicacion}</p>
                            <p>Stock/Cantidad: {producto.cantidad}</p> 

                            {/* 💰 Mostrar Precio de Costo (SOLO para Admin) - Sin ** */}
                            {isAdmin && (
                                <p className="price-cost">Costo Unitario: {formatCurrency(producto.precio_costo)}</p>
                            )}

                            {/* 🏷️ Mostrar Precio de Venta (Disponible para todos) - Sin ** */}
                            <p className="price-sale">Precio Venta: {formatCurrency(producto.precio_venta)}</p>
                            
                            {/* ❌ Se eliminó la línea "Creado por" */}
                            
                            <p>Fecha de Ingreso: {formatDate(producto.fecha_ingreso)}</p>
                            <p>Fecha de Caducidad: {formatDate(producto.fecha_caducidad)}</p>
                            
                            {/* SOLO MOSTRAR BOTONES DE ACCIÓN SI ES ADMIN */}
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