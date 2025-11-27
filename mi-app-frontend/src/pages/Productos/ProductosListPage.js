import React, { useEffect, useState } from 'react';
import * as productoService from '../../services/productoService';
//import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ListPage.css'; 

import { useAuth } from '../../contexts/AuthContext'; 

// 🔑 IMPORTACIONES NECESARIAS PARA EL MODAL Y EL FORMULARIO
import Modal from '../../components/common/Modal'; // Asume que esta ruta es correcta
import ProductoForm from './ProductoForm'; // Esta ruta ya está corregida y funciona

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
    // 🔑 Estado para controlar la visibilidad del Modal de CREACIÓN
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    // 🔑 Estado para controlar si estamos editando un producto específico
    const [editProductId, setEditProductId] = useState(null);

    // OBTENER EL ESTADO DE AUTENTICACIÓN Y EL ROL
    const { user } = useAuth(); 
    
    // Convertir a minúsculas para comparar ('Admin' vs 'admin')
    const userRole = user && user.rol ? user.rol.toLowerCase() : '';
    const isAdmin = userRole === 'admin'; 
    
    // Determina si el modal está abierto para CREAR o EDITAR
    const isModalOpen = isCreateModalOpen || (editProductId !== null);
    
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
    
    // 🔑 Función llamada al CREAR o EDITAR un producto con éxito
    const handleProductSuccess = () => {
        fetchProductos(); // Recarga la lista
        handleCloseModal(); // Cierra el modal
    };
    
    // 🔑 Función para cerrar el modal (tanto de Creación como de Edición)
    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditProductId(null); // Limpiar el ID de edición
    };

    // 🔑 Función para abrir el modal en modo EDICIÓN
    const handleOpenEditModal = (id) => {
        setEditProductId(id);
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
        <div className="list-actions-header">
            {isAdmin && (
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    Crear Nuevo Producto
                </Button>
            )}
        </div>
        {/* Eliminación de saltos de línea y espacios aquí 👈 */}
        {productos.length === 0 ? (
            <p>No hay productos registrados.</p>
        ) : (
            <ul className="list-items">
                {productos.map((producto) => (
                    <li key={producto.id_producto} className="list-item-card">
                        {/* ... contenido del producto ... */}
                        <div className="item-header">
                            <h3>{producto.nombre}</h3>
                            <span className={`alerta-tag ${getAlertClass(producto.estado_alerta)}`}>
                                {producto.estado_alerta}
                            </span>
                        </div>

                        <p><strong>Ubicación:</strong> {producto.ubicacion}</p>
                        <p><strong>Stock/Cantidad:</strong> {producto.cantidad}</p>

                        {/* 💰 Mostrar Precio de Costo (SOLO para Admin) */}
                        {isAdmin && (
                            <p className="price-cost"><strong>Costo Unitario:</strong> {formatCurrency(producto.precio_costo)}</p>
                        )}

                        {/* 🏷️ Mostrar Precio de Venta (Disponible para todos) */}
                        <p className="price-sale"><strong>Precio Venta:</strong> {formatCurrency(producto.precio_venta)}</p>

                        <p><strong>Fecha de Ingreso:</strong> {formatDate(producto.fecha_ingreso)}</p>
                        <p><strong>Fecha de Caducidad:</strong> {formatDate(producto.fecha_caducidad)}</p>

                        {/* SOLO MOSTRAR BOTONES DE ACCIÓN SI ES ADMIN */}
                        {isAdmin && (
                            <div className="item-actions">
                                {/* Botón que ABRIRÁ el Modal en modo EDICIÓN */}
                                <Button variant="secondary" onClick={() => handleOpenEditModal(producto.id_producto)}>
                                    Editar
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(producto.id_producto)}>
                                    Eliminar
                                </Button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        )}
        
        {/* 🔑 COMPONENTE MODAL ÚNICO: Usado para Creación o Edición */}
        {isAdmin && isModalOpen && (
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editProductId ? "Editar Producto" : "Crear Nuevo Producto"}
            >
                <ProductoForm 
                    onClose={handleCloseModal}
                    onSuccess={handleProductSuccess}
                    id_producto={editProductId} 
                />
            </Modal>
        )}
    </div>
);
};

export default ProductosListPage;